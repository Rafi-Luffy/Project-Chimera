import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Circle as HelpCircle, FileText, Presentation, Mail, Download, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import '../styles/ResultsDisplay.css';
import type { Publication } from '../types/agents';

interface ResultsDisplayProps {
  answer: string;
  publications: Publication[];
  agentLogs: string[];
  isProcessing: boolean;
  onRepurpose: (format: 'powerpoint' | 'executive' | 'email') => void;
  onExport: () => void;
}

interface HighlightedEntity {
  term: string;
  definition: string;
  type: 'gene' | 'subject' | 'stressor';
}

const MOCK_ENTITIES: HighlightedEntity[] = [
  { term: 'microgravity', definition: 'The condition of apparent weightlessness in orbit', type: 'stressor' },
  { term: 'bone density', definition: 'Measure of the amount of minerals in bone tissue', type: 'subject' },
  { term: 'RANK', definition: 'Receptor activator of nuclear factor kappa-B, key in bone remodeling', type: 'gene' },
  { term: 'radiation', definition: 'High-energy particles from cosmic rays and solar events', type: 'stressor' },
  { term: 'muscle atrophy', definition: 'Loss of skeletal muscle mass and strength', type: 'subject' },
];

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  answer,
  publications,
  agentLogs,
  isProcessing,
  onRepurpose,
  onExport,
}) => {
  const [showLogs, setShowLogs] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState<HighlightedEntity | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const sections = parseAnswer(answer);

  const highlightEntities = (text: string) => {
    let highlightedText = text;

    MOCK_ENTITIES.forEach((entity) => {
      const regex = new RegExp(`\\b${entity.term}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="entity entity-${entity.type}" data-term="${entity.term}">$&</span>`
      );
    });

    return highlightedText;
  };

  const handleEntityHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('entity')) {
      const term = target.dataset.term?.toLowerCase();
      const entity = MOCK_ENTITIES.find((e) => e.term.toLowerCase() === term);
      if (entity) {
        const rect = target.getBoundingClientRect();
        setTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
        setHoveredEntity(entity);
      }
    } else {
      setHoveredEntity(null);
    }
  };

  return (
    <div className="results-display">
      <div className="agent-logs-section">
        <button className="logs-toggle" onClick={() => setShowLogs(!showLogs)}>
          <Activity size={18} />
          <span>Agent Activity Log</span>
          {showLogs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showLogs && (
            <motion.div
              className="logs-container"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="logs-content">
                {agentLogs.length === 0 && !isProcessing && (
                  <p className="logs-empty">No agent activity yet. Submit a query to see the AI in action.</p>
                )}
                {agentLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    className="log-entry"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <span className="log-bullet">→</span>
                    <span className="log-text">{log}</span>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div
                    className="log-entry processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="processing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="log-text">Processing your query...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="results-content">
        <div className="main-content">
          <div className="content-header">
            <h2>Synthesized Action Brief</h2>
          </div>

          {sections.consensus && (
            <div className="result-section consensus" onMouseMove={handleEntityHover}>
              <div className="section-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="section-content">
                <h3>Consensus ({sections.confidence || 'Medium Confidence'})</h3>
                <div
                  className="section-text"
                  dangerouslySetInnerHTML={{ __html: highlightEntities(sections.consensus) }}
                />
              </div>
            </div>
          )}

          {sections.contradiction && (
            <div className="result-section contradiction" onMouseMove={handleEntityHover}>
              <div className="section-icon">
                <AlertTriangle size={20} />
              </div>
              <div className="section-content">
                <h3>Contradiction Alert</h3>
                <div
                  className="section-text"
                  dangerouslySetInnerHTML={{ __html: highlightEntities(sections.contradiction) }}
                />
              </div>
            </div>
          )}

          {sections.knowledgeGap && (
            <div className="result-section knowledge-gap" onMouseMove={handleEntityHover}>
              <div className="section-icon">
                <HelpCircle size={20} />
              </div>
              <div className="section-content">
                <h3>Knowledge Gap</h3>
                <div
                  className="section-text"
                  dangerouslySetInnerHTML={{ __html: highlightEntities(sections.knowledgeGap) }}
                />
              </div>
            </div>
          )}

          {!sections.consensus && !sections.contradiction && !sections.knowledgeGap && answer && (
            <div className="result-section general" onMouseMove={handleEntityHover}>
              <div className="section-content">
                <div
                  className="section-text"
                  dangerouslySetInnerHTML={{ __html: highlightEntities(answer) }}
                />
              </div>
            </div>
          )}

          {answer && (
            <div className="action-buttons">
              <h4>Repurpose As:</h4>
              <div className="button-group">
                <button onClick={() => onRepurpose('powerpoint')} className="action-btn">
                  <Presentation size={16} />
                  <span>PowerPoint Slide</span>
                </button>
                <button onClick={() => onRepurpose('executive')} className="action-btn">
                  <FileText size={16} />
                  <span>Executive Summary</span>
                </button>
                <button onClick={() => onRepurpose('email')} className="action-btn">
                  <Mail size={16} />
                  <span>Email Draft</span>
                </button>
              </div>
              <button onClick={onExport} className="export-btn">
                <Download size={16} />
                <span>Export Brief as Markdown</span>
              </button>
            </div>
          )}
        </div>

        <div className="evidence-panel">
          <div className="panel-header">
            <h3>Supporting Evidence</h3>
            <span className="evidence-count">{publications.length} Publications</span>
          </div>
          <div className="evidence-list">
            {publications.length === 0 && (
              <p className="evidence-empty">No publications cited yet. Submit a query to see sources.</p>
            )}
            {publications.map((pub, idx) => (
              <motion.a
                key={idx}
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="evidence-number">{idx + 1}</div>
                <div className="evidence-content">
                  <div className="evidence-title">{pub.title}</div>
                  {pub.subjects && pub.subjects.length > 0 && (
                    <div className="evidence-tags">
                      {pub.subjects.slice(0, 3).map((subject, i) => (
                        <span key={i} className="evidence-tag">
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hoveredEntity && (
          <motion.div
            className="entity-tooltip"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          >
            <div className="tooltip-header">
              <span className={`tooltip-type ${hoveredEntity.type}`}>
                {hoveredEntity.type.toUpperCase()}
              </span>
              <span className="tooltip-term">{hoveredEntity.term}</span>
            </div>
            <div className="tooltip-definition">{hoveredEntity.definition}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function parseAnswer(answer: string): {
  consensus?: string;
  contradiction?: string;
  knowledgeGap?: string;
  confidence?: string;
} {
  const sections: any = {};

  const consensusMatch = answer.match(/(?:Consensus|CONSENSUS)[\s:]+(.+?)(?=(?:Contradiction|Knowledge Gap|$))/is);
  const contradictionMatch = answer.match(/(?:Contradiction|CONTRADICTION)[\s:]+(.+?)(?=(?:Knowledge Gap|$))/is);
  const gapMatch = answer.match(/(?:Knowledge Gap|KNOWLEDGE GAP)[\s:]+(.+?)$/is);

  if (consensusMatch) {
    sections.consensus = consensusMatch[1].trim();
    const confMatch = sections.consensus.match(/\((High|Medium|Low) Confidence\)/i);
    if (confMatch) {
      sections.confidence = confMatch[1];
      sections.consensus = sections.consensus.replace(confMatch[0], '').trim();
    }
  }

  if (contradictionMatch) {
    sections.contradiction = contradictionMatch[1].trim();
  }

  if (gapMatch) {
    sections.knowledgeGap = gapMatch[1].trim();
  }

  return sections;
}

export default ResultsDisplay;
