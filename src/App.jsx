import React, { useState, useEffect } from 'react';
import './index.css';

const App = () => {
  const [celestialObjects, setCelestialObjects] = useState([]);
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [objectType, setObjectType] = useState('all');
  const [error, setError] = useState(null);
  
  // Function to fetch data from Solar System OpenData API
  const fetchSolarSystemData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from Solar System OpenData API
      const response = await fetch('https://api.le-systeme-solaire.net/rest/bodies/');
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Transform the data to match our expected format
      const transformedData = data.bodies
        .filter(body => body.isPlanet || body.bodyType === 'Dwarf Planet')
        .slice(0, 15)
        .map((body, index) => ({
          id: index + 1,
          name: body.englishName,
          type: body.isPlanet ? 'planet' : 'dwarf planet',
          distanceFromSun: body.semimajorAxis ? (body.semimajorAxis / 149598000).toFixed(2) : 'Unknown', // Convert to AU
          diameter: body.meanRadius ? (body.meanRadius * 2) : 'Unknown',
          moons: body.moons ? body.moons.length : 0,
          discoveryYear: body.discoveryDate || 'Prehistoric'
        }));
      
      setCelestialObjects(transformedData);
      setFilteredObjects(transformedData);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch data: ' + error.message);
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchSolarSystemData();
  }, []);

  // Filter objects based on search term and type filter
  useEffect(() => {
    const results = celestialObjects.filter(object => {
      const matchesSearch = object.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = objectType === 'all' || object.type === objectType;
      return matchesSearch && matchesType;
    });
    setFilteredObjects(results);
  }, [searchTerm, objectType, celestialObjects]);

  // Calculate statistics
  const totalObjects = celestialObjects.length;
  const averageDiameter = celestialObjects.length > 0 
    ? (celestialObjects.reduce((sum, obj) => {
        const diameter = typeof obj.diameter === 'number' ? obj.diameter : 0;
        return sum + diameter;
      }, 0) / totalObjects).toFixed(2)
    : 0;
  const totalMoons = celestialObjects.length > 0 
    ? celestialObjects.reduce((sum, obj) => sum + obj.moons, 0)
    : 0;

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>Space Explorer Dashboard</h1>
        <div className="stats">
          <div className="stat-card">
            <h3>Total Objects</h3>
            <p>{totalObjects}</p>
          </div>
          <div className="stat-card">
            <h3>Avg Diameter</h3>
            <p>{averageDiameter} km</p>
          </div>
          <div className="stat-card">
            <h3>Total Moons</h3>
            <p>{totalMoons}</p>
          </div>
        </div>
      </header>

      <div className="controls">
        <div className="search-box">
          <label htmlFor="search">Search Objects:</label>
          <input
            id="search"
            type="text"
            placeholder="Enter celestial object name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="type-filter">Filter by Type:</label>
          <select
            id="type-filter"
            value={objectType}
            onChange={(e) => setObjectType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="planet">Planets</option>
            <option value="dwarf planet">Dwarf Planets</option>
          </select>
        </div>
      </div>

      <div>
        <h2>Celestial Objects ({filteredObjects.length} results)</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Distance (AU)</th>
              <th>Diameter (km)</th>
              <th>Moons</th>
              <th>Discovery</th>
            </tr>
          </thead>
          <tbody>
            {filteredObjects.map((object) => (
              <tr key={object.id}>
                <td>{object.name}</td>
                <td>{object.type}</td>
                <td>{object.distanceFromSun}</td>
                <td>{typeof object.diameter === 'number' ? object.diameter.toLocaleString() : object.diameter}</td>
                <td>{object.moons}</td>
                <td>{object.discoveryYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;