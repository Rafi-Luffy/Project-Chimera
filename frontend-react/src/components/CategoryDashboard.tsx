import React, { useEffect, useState } from 'react';
import '../styles/CategoryDashboard.css';

interface Category {
  name: string;
  count: number;
  icon: string;
}

interface Topic {
  name: string;
  count: number;
}

interface Cluster {
  label: string;
  categories: string[];
  count: number;
}

interface DataSource {
  name: string;
  count: number;
  status: string;
  icon: string;
  url?: string;
}

interface CategoryData {
  categories: Category[];
  topics: Topic[];
  clusters: Cluster[];
  data_sources: DataSource[];
  total_publications: number;
  last_updated: string;
}

interface CategoryDashboardProps {
  onCategoryClick?: (categoryName: string) => void;
  searchQuery?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const CategoryDashboard: React.FC<CategoryDashboardProps> = ({ onCategoryClick, searchQuery }) => {
  const [data, setData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/categories`);
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="category-dashboard loading">
        <div className="loading-spinner">⚙️</div>
        <p>Loading research categories...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="category-dashboard error">
        <p>❌ {error || 'No data available'}</p>
      </div>
    );
  }

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? data.categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().split(' ').some(word =>
          cat.name.toLowerCase().includes(word)
        )
      )
    : data.categories;

  return (
    <div className="category-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">📊 Research Categories</h2>
        <p className="dashboard-subtitle">
          {searchQuery
            ? `${filteredCategories.length} categories matching "${searchQuery}"`
            : `Explore ${data.total_publications} space biology publications across multiple domains`}
        </p>
      </div>

      {/* Main Categories Grid */}
      <div className="categories-section">
        <h3 className="section-title">Research Domains</h3>
        <div className="categories-grid">
          {filteredCategories.map((category, index) => (
            <div
              key={index}
              className="category-card clickable"
              onClick={() => onCategoryClick && onCategoryClick(category.name)}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-info">
                <h4 className="category-name">{category.name}</h4>
                <span className="category-count">{category.count} publications</span>
              </div>
              <div className="category-bar">
                <div
                  className="category-bar-fill"
                  style={{ width: `${(category.count / data.total_publications) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Clusters - Hide when filtering */}
      {!searchQuery && data.clusters.length > 0 && (
        <div className="clusters-section">
          <h3 className="section-title">🔗 Research Clusters</h3>
          <p className="section-subtitle">Interdisciplinary research combinations</p>
          <div className="clusters-grid">
            {data.clusters.map((cluster, index) => (
              <div key={index} className="cluster-card">
                <div className="cluster-label">{cluster.label}</div>
                <div className="cluster-count">{cluster.count} studies</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Keywords - Hide when filtering */}
      {!searchQuery && (
        <div className="topics-section">
          <h3 className="section-title">🔍 Top Keywords</h3>
          <div className="topics-cloud">
            {data.topics.slice(0, 12).map((topic, index) => {
              const fontSize = 0.8 + (topic.count / data.topics[0].count) * 1.5;
              return (
                <span
                  key={index}
                  className="topic-tag"
                  style={{ fontSize: `${fontSize}rem` }}
                >
                  {topic.name} <sup>{topic.count}</sup>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="dashboard-footer">
        <p>Last updated: {new Date(data.last_updated).toLocaleString()}</p>
        <button className="refresh-button" onClick={fetchCategories}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};
