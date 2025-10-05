"""
The Orchestrator Agent - Project Manager for the Digital Research Team
Role: Coordinate all agents and manage the complete workflow
"""
from typing import Dict, Any, List, Callable, Optional
from .librarian import LibrarianAgent
from .cartographer import CartographerAgent
from .analyst import AnalystAgent
from .communicator import CommunicatorAgent
import time


class OrchestratorAgent:
    """
    The Orchestrator: Master of Coordination
    
    Responsibility: Act as project manager for the entire agent team:
    - Route queries to appropriate agents
    - Manage data flow between agents
    - Track progress and log all activities
    - Ensure seamless collaboration
    - Stream real-time updates to frontend
    """
    
    def __init__(self):
        self.name = "The Orchestrator"
        self.role = "Project Manager & Coordinator"
        
        # Initialize the agent team
        self.librarian = LibrarianAgent()
        self.cartographer = CartographerAgent()
        self.analyst = None  # Will be initialized after cartographer builds graph
        self.communicator = CommunicatorAgent()
        
        # Activity log for streaming
        self.activity_log = []
        self.is_initialized = False
        
    def log(self, message: str, agent: Optional[str] = None) -> str:
        """
        Log activity with timestamp and agent name
        
        Args:
            message: Log message
            agent: Agent name (optional, defaults to Orchestrator)
            
        Returns:
            Formatted log entry
        """
        timestamp = time.strftime("%H:%M:%S")
        agent_name = agent or self.name
        log_entry = f"[{timestamp}] [{agent_name}] {message}"
        self.activity_log.append(log_entry)
        return log_entry
    
    def initialize_knowledge_base(self, log_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """
        Initialize the knowledge base by loading publications and building the graph
        
        Args:
            log_callback: Optional callback function to stream logs to frontend
            
        Returns:
            Initialization statistics
        """
        if self.is_initialized:
            return {'status': 'already_initialized'}
        
        # Step 1: Librarian loads publications
        self.log("Initializing knowledge base...", self.name)
        if log_callback:
            log_callback(self.activity_log[-1])
        
        self.log("Loading NASA Space Biology publications...", self.librarian.name)
        if log_callback:
            log_callback(self.activity_log[-1])
        
        try:
            df = self.librarian.load_publications()
            pub_count = len(df)
            
            self.log(f"Successfully loaded {pub_count} publications", self.librarian.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 2: Cartographer builds knowledge graph
            self.log("Extracting entities and building knowledge graph...", self.cartographer.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Get first 100 publications for faster demo (can be adjusted)
            publications = self.librarian.get_all_publications(limit=200)
            
            self.log(f"Processing {len(publications)} publications...", self.cartographer.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            graph_stats = self.cartographer.build_graph(publications)
            
            self.log(
                f"Graph built: {graph_stats['total_publications']} pubs, "
                f"{graph_stats['unique_subjects']} subjects, "
                f"{graph_stats['unique_stressors']} stressors",
                self.cartographer.name
            )
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 3: Initialize Analyst with the graph
            self.analyst = AnalystAgent(self.cartographer)
            
            self.log("Knowledge base ready. All agents online.", self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            self.is_initialized = True
            
            return {
                'status': 'success',
                'statistics': graph_stats
            }
            
        except Exception as e:
            error_msg = f"Initialization failed: {str(e)}"
            self.log(error_msg, self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def process_query(
        self,
        query: str,
        persona: str = "Research Scientist",
        log_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """
        Process a user query through the complete agent workflow
        
        Args:
            query: User's research question
            persona: User's role (Research Scientist, Mission Architect, Manager)
            log_callback: Optional callback to stream logs in real-time
            
        Returns:
            Complete response with brief, evidence, and metadata
        """
        # Clear previous activity log
        self.activity_log = []
        
        # Ensure initialized
        if not self.is_initialized:
            self.log("Knowledge base not initialized. Initializing now...", self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            self.initialize_knowledge_base(log_callback)
        
        try:
            # Step 1: Deconstruct the query
            self.log(f"Deconstructing user goal: '{query}'", self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 2: Analyst extracts concepts
            self.log("Extracting key concepts from query...", self.analyst.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 3: Librarian searches publications
            self.log("Searching knowledge graph for relevant publications...", self.librarian.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 4: Analyst performs analysis
            self.log("Analyzing patterns, consensus, and contradictions...", self.analyst.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            analysis = self.analyst.analyze_query(query)
            
            self.log(
                f"Retrieved {analysis['publication_count']} relevant publications",
                self.analyst.name
            )
            if log_callback:
                log_callback(self.activity_log[-1])
            
            self.log(
                f"Analysis complete: {analysis['confidence']} confidence consensus",
                self.analyst.name
            )
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Step 5: Communicator formats output
            self.log(f"Tailoring insights for persona: {persona}", self.communicator.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            response = self.communicator.communicate(analysis, persona, query)
            
            self.log("Synthesizing final brief...", self.communicator.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            self.log("✅ Analysis complete. Ready to deliver insights.", self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            # Add activity log to response
            response['agent_log'] = self.activity_log
            response['success'] = True
            
            return response
            
        except Exception as e:
            error_msg = f"Query processing failed: {str(e)}"
            self.log(error_msg, self.name)
            if log_callback:
                log_callback(self.activity_log[-1])
            
            return {
                'success': False,
                'error': str(e),
                'agent_log': self.activity_log
            }
    
    def get_graph_statistics(self) -> Dict[str, Any]:
        """Get current knowledge graph statistics"""
        if not self.is_initialized:
            return {'status': 'not_initialized'}
        
        return self.cartographer.get_graph_stats()
