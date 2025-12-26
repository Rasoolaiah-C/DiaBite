import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
  const { isLoggedIn,currentUser } = useSelector((state) => state.userReducer);

  return (
    <div className="app">
      <section className="hero">
        <h1>Take Control of Your Diabetes</h1>
        <p>
          Your all-in-one solution for managing diabetes with smart tracking,
          personalized recommendations, and comprehensive health analytics.
        </p>
        {isLoggedIn ? (
          <Link to="/dashboard" className="button welcome-button">
            Welcome, {currentUser.name}!
          </Link>
        ) : (
          <Link to="/signup1" className="button welcome-button">
            Get Started!
          </Link>
        )}
      </section>

      <section className="features" id="features">
        <h2>Smart Features for Better Management</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Sugar Tracking</h3>
            <p>Easy and accurate blood sugar monitoring with trend analysis and alerts.</p>
          </div>
          <div className="feature-card">
            <h3>Food Tracking</h3>
            <p>Track your meals through text or voice input with detailed nutritional information.</p>
          </div>
          <div className="feature-card">
            <h3>Nutritional Insights</h3>
            <p>Comprehensive database of food items with detailed sugar and nutritional content.</p>
          </div>
          <div className="feature-card">
            <h3>AI Recommendations</h3>
            <p>Smart meal suggestions based on your blood sugar levels and dietary preferences.</p>
          </div>
          <div className="feature-card">
            <h3>Personalized Management</h3>
            <p>Customized diabetes management plans tailored to your specific needs.</p>
          </div>
          <div className="feature-card">
            <h3>Analytics Dashboard</h3>
            <p>Detailed health analytics and progress tracking for better management.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Take Control of Your Health?</h2>
        <p>
          Join thousands of users who are successfully managing their diabetes with DiaBite.
        </p>
        {currentUser ? (
          <Link to="/dashboard" className="button welcome-button">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/signup1" className="button">
            Sign Up Now
          </Link>
        )}
      </section>
    </div>
  );
}

export default Home;
