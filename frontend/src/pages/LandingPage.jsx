import { Link } from 'react-router-dom';
import {
    FiCloud,
    FiMapPin,
    FiSend,
    FiSettings,
    FiCalendar,
    FiCreditCard,
    FiNavigation,
    FiPlay,
    FiFacebook,
    FiInstagram,
    FiTwitter,
    FiHeart,
    FiStar,
    FiMap
} from "react-icons/fi";
import { MdFlightTakeoff } from "react-icons/md";
import { BsBuilding } from "react-icons/bs";

function LandingPage() {
    return (
        <div className="landing-page min-h-screen relative overflow-hidden text-slate-600 bg-surface">
            {/* Ambient Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Navigation (Glassmorphism) */}
            <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-0">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-full px-6 py-4 flex items-center justify-between">
                        <div className="logo font-display font-bold text-2xl text-slate-900 tracking-tighter">Jadoo.</div>
                        <ul className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-900">
                            <li><a href="#destinations" className="hover:text-primary transition-colors">Destinations</a></li>
                            <li><a href="#hotels" className="hover:text-primary transition-colors">Hotels</a></li>
                            <li><a href="#flights" className="hover:text-primary transition-colors">Flights</a></li>
                            <li><a href="#bookings" className="hover:text-primary transition-colors">Bookings</a></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                            <li>
                                <Link to="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-primary transition-all shadow-md hover:shadow-lg text-sm">Sign up</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="hero-text space-y-6">
                        <p className="text-secondary font-bold tracking-widest uppercase text-sm animate-fade-in-up">Best Destinations around the world</p>
                        <h1 className="font-display text-5xl md:text-7xl/[1.1] font-bold text-slate-900 animate-fade-in-up [animation-delay:200ms]">
                            Travel, enjoy <span className="relative whitespace-nowrap"><span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/30 -z-10 bg-contain"></span>and live</span> a new and full life
                        </h1>
                        <p className="text-lg leading-relaxed max-w-lg animate-fade-in-up [animation-delay:400ms]">
                            Built Wicket longer admire do barton vanity itself do in it.
                            Preferred to sportsmen it engrossed listening. Park gate sell
                            they west hard for the.
                        </p>
                        <div className="flex items-center gap-6 pt-4 animate-fade-in-up [animation-delay:600ms]">
                            <button className="px-8 py-4 bg-secondary text-white rounded-2xl font-medium shadow-lg hover:shadow-secondary/30 hover:-translate-y-1 transition-all">Find out more</button>
                            <button className="flex items-center gap-3 group text-slate-500 hover:text-primary transition-colors">
                                <span className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg group-hover:scale-110 transition-transform"><FiPlay className="ml-1" /></span>
                                Play Demo
                            </button>
                        </div>
                    </div>
                    <div className="hero-image relative animate-float">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                            <img src="landing.png" alt="Traveler" className="w-full object-cover" />
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute top-10 -right-10 w-full h-full border-2 border-primary/20 rounded-[3rem] -z-10"></div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20" id="services">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Category</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">We Offer Best Services</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <FiCloud size={32} />, title: 'Calculated Weather', desc: 'Built Wicket longer admire do barton vanity itself do in it.' },
                            { icon: <MdFlightTakeoff size={32} />, title: 'Best Flights', desc: 'Engrossed listening. Park gate sell they west hard for the.' },
                            { icon: <FiCalendar size={32} />, title: 'Local Events', desc: 'Barton vanity itself do in it. Preferred to men it engrossed listening.' },
                            { icon: <FiSettings size={32} />, title: 'Customization', desc: 'We deliver outsourced aviation services for military customers' }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 text-center relative z-10 overflow-hidden">
                                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/20 rounded-tl-3xl z-[-1] transition-all group-hover:scale-[10]"></div>
                                <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center bg-primary/10 text-primary rounded-3xl group-hover:bg-primary group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="font-display text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destinations Section - Bento Grid */}
            <section className="py-20" id="destinations">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Top Selling</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Top Destinations</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
                        {[
                            {
                                id: 1,
                                title: "Khám phá Đà Nẵng",
                                image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=60",
                                rating: 4.8,
                                price: "2,500,000",
                                tag: "Best Seller",
                                colSpan: "md:col-span-2"
                            },
                            {
                                id: 2,
                                title: "Vịnh Hạ Long",
                                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
                                rating: 4.9,
                                price: "3,200,000",
                                tag: "Popular",
                                colSpan: "md:col-span-1"
                            },
                            {
                                id: 3,
                                title: "Phố cổ Hội An",
                                image: "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
                                rating: 4.7,
                                price: "1,800,000",
                                tag: "Must Visit",
                                colSpan: "md:col-span-1"
                            },
                            {
                                id: 4,
                                title: "Đà Lạt Mộng Mơ",
                                image: "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
                                rating: 4.6,
                                price: "2,100,000",
                                tag: "Romantic",
                                colSpan: "md:col-span-2"
                            },
                        ].map((dest, i) => (
                            <div key={i} className={`group relative rounded-[2.5rem] overflow-hidden shadow-lg ${dest.colSpan}`}>
                                <img src={dest.image} alt={dest.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                <div className="absolute top-6 left-6">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full">
                                        {dest.tag}
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                    <div className="flex justify-between items-end backdrop-blur-md bg-white/10 p-6 rounded-3xl border border-white/20">
                                        <div>
                                            <h3 className="font-display text-2xl font-bold mb-2">{dest.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-200">
                                                <FiStar className="text-yellow-400 fill-yellow-400" /> {dest.rating}
                                            </div>
                                        </div>
                                        <span className="font-bold text-xl bg-white text-slate-900 px-4 py-2 rounded-xl shadow-lg">{dest.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section className="py-20 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 md:flex gap-16 items-center">
                    <div className="flex-1 space-y-10">
                        <div>
                            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Easy and Fast</p>
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Book your next trip in 3 easy steps</h2>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: <FiMapPin />, title: "Choose Destination", color: "bg-yellow-400" },
                                { icon: <FiCreditCard />, title: "Make Payment", color: "bg-secondary" },
                                { icon: <MdFlightTakeoff />, title: "Reach Airport on Selected Date", color: "bg-primary" }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 items-start group">
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${step.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg text-slate-900 mb-1">{step.title}</h4>
                                        <p className="text-slate-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, tortor tempus.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 mt-12 md:mt-0 relative">
                        {/* Glassmorphism Card */}
                        <div className="relative z-10 bg-white rounded-[2.5rem] p-6 shadow-2xl max-w-sm mx-auto animate-float">
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-6">
                                <img src="https://images.ctfassets.net/wv75stsetqy3/18jOEJrhKM7WA81nkCKZV8/6f70df258ed1233d5c3a8e3f01298b06/Greece.jpg?q=60&fit=fill&fm=webp" alt="Greece" className="object-cover w-full h-full" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Trip To Greece</h3>
                            <p className="text-slate-500 mb-6 flex items-center gap-2">
                                <span className="w-px h-4 bg-slate-300"></span> 14-29 June | by Robbin joseph
                            </p>
                            <div className="flex gap-4 mb-8">
                                {[BsBuilding, FiMap, FiSend].map((Icon, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                                        <Icon />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <BsBuilding /> <span>24 people going</span>
                                </div>
                                <FiHeart className="text-primary text-xl cursor-pointer hover:fill-primary transition-colors" />
                            </div>
                            {/* Floating Trip Status */}
                            <div className="absolute -right-16 bottom-16 bg-white p-4 rounded-3xl shadow-xl flex items-start gap-4 animate-float [animation-delay:1s] hidden md:flex">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold">Ongoing</p>
                                    <h5 className="font-bold text-slate-900">Trip to Rome</h5>
                                    <p className="text-primary font-bold text-sm mt-1">40% completed</p>
                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <div className="w-[40%] h-full bg-primary rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] -z-10 rounded-full"></div>
                    </div>
                </div>
            </section >

            {/* Testimonials Section */}
            < section className="py-20" >
                <div className="max-w-7xl mx-auto px-6 md:flex gap-20">
                    <div className="md:w-1/2">
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Testimonials</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-12">What people say about Us.</h2>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-900"></span>
                            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative mt-12 md:mt-0">
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl relative z-10 max-w-lg">
                            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img src="https://i.pravatar.cc/150?img=12" alt="Mike" />
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg mb-8 pt-4">
                                "On the Windows talking painted pasture yet its express parties use.
                                Sure last upon he same as knew next. Of believed or diverted no."
                            </p>
                            <div>
                                <h4 className="font-display font-bold text-lg text-slate-900">Mike Taylor</h4>
                                <p className="text-slate-500 text-sm">Lahore, Pakistan</p>
                            </div>
                        </div>
                        {/* Stacked Card Effect */}
                        <div className="absolute top-10 left-10 w-full h-full bg-slate-50 rounded-[2rem] -z-10 border border-slate-100"></div>
                    </div>
                </div>
            </section >

            {/* Subscribe Section */}
            < section className="py-20 relative px-6 md:px-0" >
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="bg-primary/10 rounded-tl-[4rem] rounded-br-[2rem] rounded-tr-[2rem] rounded-bl-[1rem] p-10 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary/20 blur-3xl"></div>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-12 max-w-3xl mx-auto leading-normal">
                            Subscribe to get information, latest news and other
                            interesting offers about Jadoo
                        </h2>

                        <div className="flex flex-col md:flex-row gap-6 max-w-xl mx-auto">
                            <div className="flex-1 bg-white rounded-3xl px-6 py-4 flex items-center gap-4 shadow-sm border border-white/50">
                                <FiSend className="text-slate-400 text-xl" />
                                <input type="email" placeholder="Your email" className="flex-1 outline-none text-slate-700 bg-transparent" />
                            </div>
                            <button className="bg-secondary text-white px-10 py-4 rounded-3xl font-medium shadow-lg shadow-secondary/30 hover:bg-orange-600 transition-colors">
                                Subscribe
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    </div>
                </div>
            </section >

            {/* Footer */}
            < footer className="pt-20 pb-10 bg-white" >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
                        <div className="md:col-span-2">
                            <div className="font-display font-bold text-3xl text-slate-900 tracking-tighter mb-6">Jadoo.</div>
                            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">Book your trip in minute, get full Control for much longer.</p>
                        </div>
                        {[
                            { title: 'Company', links: ['About', 'Careers', 'Mobile'] },
                            { title: 'Contact', links: ['Help/FAQ', 'Press', 'Affiliates'] },
                            { title: 'More', links: ['Airline fees', 'Airline', 'Low fare tips'] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-slate-900 mb-6">{col.title}</h4>
                                <ul className="space-y-4">
                                    {col.links.map((link, j) => (
                                        <li key={j}><a href={`#${link.toLowerCase()}`} className="text-slate-500 hover:text-primary transition-colors text-sm font-medium">{link}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100">
                        <p className="text-slate-400 text-sm font-medium">All rights reserved@jadoo.co</p>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            {[FiFacebook, FiInstagram, FiTwitter].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all">
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}

export default LandingPage;
