"""
Data Ingestion Script for NASA Space Biology Knowledge Engine
This script reads the CSV of publications, scrapes full text, extracts structured data using LLM,
and populates the Neo4j knowledge graph.
"""

import pandas as pd
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from neo4j import GraphDatabase
import os
import time
from dotenv import load_dotenv
from typing import List

# Load environment variables
load_dotenv()


# --- 1. Define Pydantic Model for structured output ---
class PublicationInfo(BaseModel):
    """Structured information extracted from a scientific publication."""
    main_subject: str = Field(
        description="The primary subject of the study, e.g., 'Mice', 'Arabidopsis thaliana', 'Human Cells'."
    )
    key_stressors: List[str] = Field(
        description="The environmental stressors studied, e.g., 'Microgravity', 'Space Radiation', 'Hindlimb Unloading'."
    )
    key_findings: List[str] = Field(
        description="A list of 3-5 concise, crucial findings from the paper."
    )
    mentioned_genes_proteins: List[str] = Field(
        description="A list of specific genes or proteins mentioned, e.g., 'CDKN1a/p21', 'FYN'."
    )


class Neo4jIngester:
    """Handles connection to Neo4j and data ingestion."""
    
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
        )
        
    def close(self):
        """Close the Neo4j driver connection."""
        self.driver.close()
    
    def create_constraints(self):
        """Create uniqueness constraints on the graph for data integrity."""
        with self.driver.session() as session:
            # Ensure unique publications
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (p:Publication) REQUIRE p.title IS UNIQUE")
            # Ensure unique subjects
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (s:Subject) REQUIRE s.name IS UNIQUE")
            # Ensure unique stressors
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (st:Stressor) REQUIRE st.name IS UNIQUE")
            # Ensure unique genes/proteins
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (g:GeneProtein) REQUIRE g.name IS UNIQUE")
        print("✓ Database constraints created")
    
    def ingest_publication(self, title: str, url: str, info: PublicationInfo):
        """Ingest a single publication and its extracted information into the graph."""
        with self.driver.session() as session:
            # Create Publication Node
            session.run(
                "MERGE (p:Publication {title: $title, url: $url})",
                title=title, url=url
            )
            
            # Create and link Subject node
            if info.main_subject:
                session.run("""
                    MATCH (p:Publication {title: $title})
                    MERGE (s:Subject {name: $subject})
                    MERGE (p)-[:STUDIES]->(s)
                """, title=title, subject=info.main_subject)
            
            # Create and link Stressor nodes
            for stressor in info.key_stressors:
                session.run("""
                    MATCH (p:Publication {title: $title})
                    MERGE (st:Stressor {name: $stressor})
                    MERGE (p)-[:APPLIES]->(st)
                """, title=title, stressor=stressor)
            
            # Create and link GeneProtein nodes
            for gene in info.mentioned_genes_proteins:
                session.run("""
                    MATCH (p:Publication {title: $title})
                    MERGE (g:GeneProtein {name: $gene})
                    MERGE (p)-[:MENTIONS]->(g)
                """, title=title, gene=gene)
            
            # Create Finding nodes
            for idx, finding in enumerate(info.key_findings):
                session.run("""
                    MATCH (p:Publication {title: $title})
                    CREATE (f:Finding {text: $finding, index: $idx})
                    MERGE (p)-[:REPORTS]->(f)
                """, title=title, finding=finding, idx=idx)


def ingest_and_graph():
    """Main ingestion function."""
    print("🚀 Starting NASA Space Biology Knowledge Graph Ingestion...")
    
    # Initialize Neo4j connection
    ingester = Neo4jIngester()
    ingester.create_constraints()
    
    # Setup LLM and Parser
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
    parser = PydanticOutputParser(pydantic_object=PublicationInfo)
    
    # Create a prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert at reading scientific papers and extracting key information. 
        Extract the following information from the text provided. 
        Be precise and specific. For genes and proteins, use standard nomenclature.
        {format_instructions}"""),
        ("human", "Title: {title}\n\nContent: {text}")
    ])
    
    chain = prompt | llm | parser
    
    # Read CSV with Pandas
    csv_path = os.path.join(os.path.dirname(__file__), '../data/SB_publication_PMC.csv')
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: CSV file not found at {csv_path}")
        print("Please place SB_publication_PMC.csv in the data/ directory")
        return
    
    df = pd.read_csv(csv_path)
    print(f"📊 Found {len(df)} publications to process")
    
    successful = 0
    failed = 0
    
    for index, row in df.iterrows():
        url = row['Link']
        title = row['Title']
        
        print(f"\n[{index + 1}/{len(df)}] Processing: {title[:60]}...")
        
        try:
            # Scrape the publication
            loader = WebBaseLoader(url)
            documents = loader.load()
            
            if not documents:
                print(f"  ⚠️  No content retrieved from {url}")
                failed += 1
                continue
            
            text = documents[0].page_content
            
            # Extract structured information using LLM
            response: PublicationInfo = chain.invoke({
                "text": text[:8000],  # Limit text to avoid token limits
                "title": title,
                "format_instructions": parser.get_format_instructions()
            })
            
            print(f"  ✓ Extracted: Subject={response.main_subject}, "
                  f"Stressors={len(response.key_stressors)}, "
                  f"Genes={len(response.mentioned_genes_proteins)}")
            
            # Ingest into Neo4j
            ingester.ingest_publication(title, url, response)
            successful += 1
            
            # Rate limiting to avoid overwhelming the API
            time.sleep(1)
            
        except Exception as e:
            print(f"  ❌ Error processing: {str(e)}")
            failed += 1
            continue
    
    ingester.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Ingestion Complete!")
    print(f"   Successful: {successful}")
    print(f"   Failed: {failed}")
    print(f"   Total: {len(df)}")
    print(f"{'='*60}")


if __name__ == "__main__":
    ingest_and_graph()
