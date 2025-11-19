import { Link } from 'react-router-dom';
import './LandingPage.css';
import { TiWeatherCloudy } from "react-icons/ti";
import { MdFlight } from "react-icons/md";
import { MdEvent } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";

function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <div className="logo">Jadoo.</div>
                        <ul className="nav-links">
                            <li><a href="#destinations">Destinations</a></li>
                            <li><a href="#hotels">Hotels</a></li>
                            <li><a href="#flights">Flights</a></li>
                            <li><a href="#bookings">Bookings</a></li>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register" className="btn-signup">Sign up</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <p className="hero-subtitle">BEST DESTINATIONS AROUND THE WORLD</p>
                            <h1 className="hero-title">
                                Travel, enjoy<br />
                                and live a new<br />
                                and full life
                            </h1>
                            <p className="hero-description">
                                Built Wicket longer admire do barton vanity itself do in it.
                                Preferred to sportsmen it engrossed listening. Park gate sell
                                they west hard for the.
                            </p>
                            <div className="hero-cta">
                                <button className="btn-primary">Find out more</button>
                                <button className="btn-play">
                                    <span className="play-icon">▶</span>
                                    Play Demo
                                </button>
                            </div>
                        </div>
                        <div className="hero-image" style={{ marginLeft: '-120px' }}>
                            <img src="landing.png" alt="" srcset="" style={{ width: '100%', height: 'auto' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}}
            <section className="services" id="services">
                <div className="container">
                    <p className="section-subtitle">CATEGORY</p>
                    <h2 className="section-title">We Offer Best Services</h2>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon weather"><TiWeatherCloudy /></div>
                            <h3>Calculated Weather</h3>
                            <p>Built Wicket longer admire do barton vanity itself do in it.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon flights"><MdFlight /></div>
                            <h3>Best Flights</h3>
                            <p>Engrossed listening. Park gate sell they west hard for the.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon events"><MdEvent /></div>
                            <h3>Local Events</h3>
                            <p>Barton vanity itself do in it. Preferred to men it engrossed listening.</p>
                        </div>
                        <div className="service-card">
                            <div className="service-icon custom"><IoSettingsOutline /></div>
                            <h3>Customization</h3>
                            <p>We deliver outsourced aviation services for military customers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Destinations Section */}
            <section className="destinations" id="destinations">
                <div className="container">
                    <p className="section-subtitle">Top Selling</p>
                    <h2 className="section-title">Top Destinations</h2>
                    <div className="destinations-grid">
                        <div className="destination-card">
                            <div className="destination-image">
                                <img src="https://i.natgeofe.com/k/a6c9f195-de20-445d-9d36-745ef56042c5/OG_Colosseum_Ancient-Rome_KIDS_1122_3x2.jpg" alt="Rome, Italy" />
                            </div>
                            <div className="destination-info">
                                <h3>Rome, Italy</h3>
                                <p>📍 10 Days Trip</p>
                                <p className="price">$5,42k</p>
                            </div>
                        </div>
                        <div className="destination-card">
                            <div className="destination-image">
                                <img src="https://res.cloudinary.com/aenetworks/image/upload/c_fill,ar_2,w_3840,h_1920,g_auto/dpr_auto/f_auto/q_auto:eco/v1/topic-london-gettyimages-760251843-feature?_a=BAVAZGID0" alt="" srcset="" />
                            </div>
                            <div className="destination-info">
                                <h3>London, UK</h3>
                                <p>📍 12 Days Trip</p>
                                <p className="price">$4.2k</p>
                            </div>
                        </div>
                        <div className="destination-card">
                            <div className="destination-image">
                                <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/d6/c6/f8/caption.jpg?w=1400&h=1400&s=1&cx=989&cy=446&chk=v1_05762c604da56e26277e" alt="" srcset="" />
                            </div>
                            <div className="destination-info">
                                <h3>Full Europe</h3>
                                <p>📍 28 Days Trip</p>
                                <p className="price">$15k</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section className="booking">
                <div className="container">
                    <div className="booking-content">
                        <div className="booking-text">
                            <p className="section-subtitle">Easy and Fast</p>
                            <h2 className="section-title">Book your next trip<br />in 3 easy steps</h2>
                            <div className="booking-steps">
                                <div className="step">
                                    <div className="step-icon destination">🗺️</div>
                                    <div className="step-content">
                                        <h4>Choose Destination</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-icon payment">💳</div>
                                    <div className="step-content">
                                        <h4>Make Payment</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-icon airport">🚕</div>
                                    <div className="step-content">
                                        <h4>Reach Airport on Selected Date</h4>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="booking-preview">
                            <div className="trip-card">
                                <div className="trip-image">
                                    <img src="https://images.ctfassets.net/wv75stsetqy3/18jOEJrhKM7WA81nkCKZV8/6f70df258ed1233d5c3a8e3f01298b06/Greece.jpg?q=60&fit=fill&fm=webp" alt="" srcset="" />
                                </div>
                                <h3>Trip To Greece</h3>
                                <p>14-29 June | by Robbin joseph</p>
                                <div className="trip-options">
                                    <span>🍃</span>
                                    <span>🗺️</span>
                                    <span>📍</span>
                                </div>
                                <p>👥 24 people going</p>
                                <span className="heart">❤️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials">
                <div className="container">
                    <div className="testimonials-content">
                        <div className="testimonials-text">
                            <p className="section-subtitle">TESTIMONIALS</p>
                            <h2 className="section-title">What people say<br />about Us.</h2>
                        </div>
                        <div className="testimonials-cards">
                            <div className="testimonial-card active">
                                <div className="testimonial-avatar"></div>
                                <p className="testimonial-text">
                                    "On the Windows talking painted pasture yet its express parties use.
                                    Sure last upon he same as knew next. Of believed or diverted no."
                                </p>
                                <h4>Mike taylor</h4>
                                <p className="location">Lahore, Pakistan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscribe Section */}
            <section className="subscribe">
                <div className="container">
                    <div className="subscribe-box">
                        <h2>Subscribe to get information, latest news and other<br />interesting offers about Jadoo</h2>
                        <div className="subscribe-form">
                            <input type="email" placeholder="Your email" />
                            <button className="btn-subscribe">Subscribe</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-col">
                            <h3 className="footer-logo">Jadoo.</h3>
                            <p>Book your trip in minute, get full Control for much longer.</p>
                        </div>
                        <div className="footer-col">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#about">About</a></li>
                                <li><a href="#careers">Careers</a></li>
                                <li><a href="#mobile">Mobile</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Contact</h4>
                            <ul>
                                <li><a href="#help">Help/FAQ</a></li>
                                <li><a href="#press">Press</a></li>
                                <li><a href="#affiliates">Affiliates</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>More</h4>
                            <ul>
                                <li><a href="#fees">Airline fees</a></li>
                                <li><a href="#airline">Airline</a></li>
                                <li><a href="#tips">Low fare tips</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Discover our app</h4>
                            <div className="app-buttons">
                                <button className="app-btn">Google Play</button>
                                <button className="app-btn">App Store</button>
                            </div>
                            <div className="social-links">
                                <a href="#facebook">📘</a>
                                <a href="#instagram">📷</a>
                                <a href="#twitter">🐦</a>
                            </div>
                        </div>
                    </div>
                    <p className="copyright">All rights reserved@jadoo.co</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
