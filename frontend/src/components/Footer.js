import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
  // Main Footer Styles
  const footerStyles = {
    background: "#f8f9fa",
    padding: "2rem 0",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.05)", // Soft shadow
  };

  // Heading Style
  const headingStyle = {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#004085",
    marginBottom: "1rem",
  };

  // Link Styles
  const linkStyle = {
    color: "#495057",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "color 0.3s ease, transform 0.2s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  // Icon Styles for Social Media
  const iconStyle = {
    fontSize: "1.6rem",
    color: "#495057",
    transition: "transform 0.3s ease, color 0.3s ease",
    cursor: "pointer",
  };

  return (
    <footer style={footerStyles}>
      <Container>
        <Row className="text-center text-md-start align-items-center">
          {/* Quick Links */}
          <Col xs={12} md={4} className="mb-3">
            <h5 style={headingStyle}>Quick Links</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { text: "Home", link: "/" },
                { text: "About", link: "/about" },
                { text: "Contact", link: "/contact" },
                { text: "Privacy Policy", link: "/privacy-policy" },
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: "0.5rem" }}>
                  <a
                    href={item.link}
                    style={linkStyle}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#007bff";
                      e.target.style.transform = "translateX(5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = linkStyle.color;
                      e.target.style.transform = "none";
                    }}
                  >
                    ➤ {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Social Media */}
          <Col xs={12} md={4} className="mb-3 text-center">
          <h5 style={headingStyle}>Follow Us</h5>
          <div className="d-flex justify-content-center gap-3">
            {[
              { icon: <FaGithub />, link: "https://github.com/HemanthThummepalli-Git/DiaBite", bgColor: "#333" },
              { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/hemanth-thummepalli-48b580254/", bgColor: "#0077b5" },
              { icon: <FaInstagram />, link: "https://instagram.com/", bgColor: "#c13584" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50px", // Slightly increased to avoid clipping
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: social.bgColor,
                  color: "#fff",
                  textDecoration: "none",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  overflow: "visible", // Ensures the icon is not clipped
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.2)";
                  e.currentTarget.style.boxShadow = `0px 0px 12px ${social.bgColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6em", // Ensures icon scales properly
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </Col>




          {/* Copyright */}
          <Col xs={12} md={4} className="text-center text-md-end">
            <h5 style={headingStyle}>© {new Date().getFullYear()} DiaBite</h5>
            <p style={{ fontSize: "0.9rem", color: "#6c757d", margin: 0 }}>
            Smart Tracking, Smarter Eating!
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
