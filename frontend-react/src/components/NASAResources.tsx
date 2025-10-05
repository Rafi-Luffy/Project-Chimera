import { motion } from 'framer-motion';
import { Database, BookOpen, FileText, ExternalLink } from 'lucide-react';
import '../styles/NASAResources.css';

const NASA_RESOURCES = [
  {
    id: 1,
    title: 'NASA Open Science Data Repository',
    description: 'Access 500+ biological experiments from space missions',
    url: 'https://science.nasa.gov/biological-physical/data/',
    icon: Database,
  },
  {
    id: 2,
    title: 'NASA Space Life Sciences Library',
    description: 'Comprehensive space life sciences literature database',
    url: 'https://public.ksc.nasa.gov/nslsl/',
    icon: BookOpen,
  },
  {
    id: 3,
    title: 'NASA Task Book',
    description: 'Research projects, progress reports & publication listings',
    url: 'https://taskbook.nasaprs.com/tbp/welcome.cfm',
    icon: FileText,
  },
];

const NASAResources: React.FC = () => {
  return (
    <div className="nasa-resources">
      <div className="resources-header">
        <Database size={24} strokeWidth={1.5} />
        <div>
          <h2>NASA Data Sources</h2>
          <p>Trusted repositories powering our AI intelligence</p>
        </div>
      </div>

      <div className="resources-grid">
        {NASA_RESOURCES.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <motion.a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="resource-icon">
                <Icon size={28} strokeWidth={1.5} />
              </div>
              <div className="resource-content">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </div>
              <div className="resource-link">
                <ExternalLink size={18} strokeWidth={2} />
              </div>
            </motion.a>
          );
        })}
      </div>

      <div className="resources-footer">
        Our AI agents synthesize insights from these trusted NASA sources
      </div>
    </div>
  );
};

export default NASAResources;
