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
                        <ul className="flex items-center gap-4 md:gap-8 font-medium text-sm text-slate-900">
                            <li className="hidden md:block"><a href="#destinations" className="hover:text-primary transition-colors">Điểm đến</a></li>
                            <li className="hidden md:block"><a href="#hotels" className="hover:text-primary transition-colors">Khách sạn</a></li>
                            <li className="hidden md:block"><a href="#flights" className="hover:text-primary transition-colors">Chuyến bay</a></li>
                            <li className="hidden md:block"><a href="#bookings" className="hover:text-primary transition-colors">Đặt chỗ</a></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Đăng nhập</Link></li>
                            <li>
                                <Link to="/register" className="px-4 md:px-5 py-2 md:py-2.5 bg-slate-900 text-white rounded-full hover:bg-primary transition-all shadow-md hover:shadow-lg text-xs md:text-sm">Đăng ký</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="hero-text space-y-6">
                        <p className="text-secondary font-bold tracking-widest uppercase text-sm animate-fade-in-up">Những điểm đến tuyệt vời nhất thế giới</p>
                        <h1 className="font-display text-5xl md:text-7xl/[1.1] font-bold text-slate-900 animate-fade-in-up [animation-delay:200ms]">
                            Du lịch, tận hưởng <span className="relative whitespace-nowrap"><span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/30 -z-10 bg-contain"></span>và sống</span> một cuộc sống mới và trọn vẹn
                        </h1>
                        <p className="text-lg leading-relaxed max-w-lg animate-fade-in-up [animation-delay:400ms]">
                            Khám phá thế giới với những trải nghiệm du lịch đáng nhớ. 
                            Chúng tôi mang đến cho bạn những chuyến đi tuyệt vời nhất 
                            với dịch vụ chất lượng cao.
                        </p>
                        <div className="flex items-center gap-6 pt-4 animate-fade-in-up [animation-delay:600ms]">
                            <button className="px-8 py-4 bg-secondary text-white rounded-2xl font-medium shadow-lg hover:shadow-secondary/30 hover:-translate-y-1 transition-all">Tìm hiểu thêm</button>
                            <button className="flex items-center gap-3 group text-slate-500 hover:text-primary transition-colors">
                                <span className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full shadow-lg group-hover:scale-110 transition-transform"><FiPlay className="ml-1" /></span>
                                Xem Demo
                            </button>
                        </div>
                    </div>
                    <div className="hero-image relative animate-float">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                            <img src="landing.png" alt="Du khách" className="w-full object-cover" />
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
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Danh mục</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Dịch vụ tốt nhất</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <FiCloud size={32} />, title: 'Dự báo thời tiết', desc: 'Cung cấp thông tin thời tiết chính xác để bạn có kế hoạch du lịch tốt nhất.' },
                            { icon: <MdFlightTakeoff size={32} />, title: 'Chuyến bay tốt nhất', desc: 'Đặt vé máy bay với giá tốt nhất và các hãng hàng không uy tín.' },
                            { icon: <FiCalendar size={32} />, title: 'Sự kiện địa phương', desc: 'Khám phá các sự kiện và lễ hội đặc sắc tại điểm đến của bạn.' },
                            { icon: <FiSettings size={32} />, title: 'Tùy chỉnh theo nhu cầu', desc: 'Thiết kế chuyến đi riêng của bạn với các dịch vụ tùy chọn linh hoạt.' }
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
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Bán chạy nhất</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Điểm đến hàng đầu</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
                        {[
                            {
                                id: 1,
                                title: "Khám phá Đà Nẵng",
                                image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=500&q=60",
                                rating: 4.8,
                                price: "2,500,000",
                                tag: "Bán chạy nhất",
                                colSpan: "md:col-span-2"
                            },
                            {
                                id: 2,
                                title: "Vịnh Hạ Long",
                                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=60",
                                rating: 4.9,
                                price: "3,200,000",
                                tag: "Phổ biến",
                                colSpan: "md:col-span-1"
                            },
                            {
                                id: 3,
                                title: "Phố cổ Hội An",
                                image: "https://daivietourist.vn/wp-content/uploads/2025/05/gioi-thieu-ve-pho-co-hoi-an-8.jpg",
                                rating: 4.7,
                                price: "1,800,000",
                                tag: "Phải ghé thăm",
                                colSpan: "md:col-span-1"
                            },
                            {
                                id: 4,
                                title: "Đà Lạt Mộng Mơ",
                                image: "https://www.dalattrip.com/dulich/media/2017/12/thanh-pho-da-lat.jpg",
                                rating: 4.6,
                                price: "2,100,000",
                                tag: "Lãng mạn",
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
                            <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Dễ dàng và nhanh chóng</p>
                            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900">Đặt chuyến đi tiếp theo trong 3 bước đơn giản</h2>
                        </div>

                        <div className="space-y-8">
                            {[
                                { icon: <FiMapPin />, title: "Chọn điểm đến", desc: "Chọn điểm đến yêu thích của bạn từ danh sách các địa điểm tuyệt vời.", color: "bg-yellow-400" },
                                { icon: <FiCreditCard />, title: "Thanh toán", desc: "Thanh toán dễ dàng và an toàn với nhiều phương thức khác nhau.", color: "bg-secondary" },
                                { icon: <MdFlightTakeoff />, title: "Đến sân bay vào ngày đã chọn", desc: "Chuẩn bị hành trang và đến sân bay đúng giờ để bắt đầu hành trình.", color: "bg-primary" }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 items-start group">
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${step.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {step.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-display font-bold text-lg text-slate-900 mb-1">{step.title}</h4>
                                        <p className="text-slate-500">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 mt-12 md:mt-0 relative">
                        {/* Glassmorphism Card */}
                        <div className="relative z-10 bg-white rounded-[2.5rem] p-6 shadow-2xl max-w-sm mx-auto animate-float">
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] mb-6">
                                <img src="https://images.ctfassets.net/wv75stsetqy3/18jOEJrhKM7WA81nkCKZV8/6f70df258ed1233d5c3a8e3f01298b06/Greece.jpg?q=60&fit=fill&fm=webp" alt="Hy Lạp" className="object-cover w-full h-full" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Du lịch Hy Lạp</h3>
                            <p className="text-slate-500 mb-6 flex items-center gap-2">
                                <span className="w-px h-4 bg-slate-300"></span> 14-29 Tháng 6 | bởi Robbin Joseph
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
                                    <BsBuilding /> <span>24 người đang đi</span>
                                </div>
                                <FiHeart className="text-primary text-xl cursor-pointer hover:fill-primary transition-colors" />
                            </div>
                            {/* Floating Trip Status */}
                            <div className="absolute -right-16 bottom-16 bg-white p-4 rounded-3xl shadow-xl flex items-start gap-4 animate-float [animation-delay:1s] hidden md:flex">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-semibold">Đang diễn ra</p>
                                    <h5 className="font-bold text-slate-900">Du lịch Rome</h5>
                                    <p className="text-primary font-bold text-sm mt-1">Hoàn thành 40%</p>
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
                        <p className="text-slate-500 font-semibold uppercase tracking-wider mb-2">Đánh giá</p>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mb-12">Mọi người nói gì về chúng tôi</h2>
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
                                "Dịch vụ tuyệt vời! Tôi đã có những trải nghiệm du lịch tuyệt vời 
                                với sự hỗ trợ tận tình từ đội ngũ. Chắc chắn sẽ quay lại lần nữa."
                            </p>
                            <div>
                                <h4 className="font-display font-bold text-lg text-slate-900">Minh Tuấn</h4>
                                <p className="text-slate-500 text-sm">Hà Nội, Việt Nam</p>
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
                            Đăng ký để nhận thông tin, tin tức mới nhất và các ưu đãi thú vị về Jadoo
                        </h2>

                        <div className="flex flex-col md:flex-row gap-6 max-w-xl mx-auto">
                            <div className="flex-1 bg-white rounded-3xl px-6 py-4 flex items-center gap-4 shadow-sm border border-white/50">
                                <FiSend className="text-slate-400 text-xl" />
                                <input type="email" placeholder="Email của bạn" className="flex-1 outline-none text-slate-700 bg-transparent" />
                            </div>
                            <button className="bg-secondary text-white px-10 py-4 rounded-3xl font-medium shadow-lg shadow-secondary/30 hover:bg-orange-600 transition-colors">
                                Đăng ký
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
                            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">Đặt chuyến đi của bạn trong vài phút, kiểm soát hoàn toàn trong thời gian dài hơn.</p>
                        </div>
                        {[
                            { title: 'Công ty', links: ['Về chúng tôi', 'Tuyển dụng', 'Ứng dụng'] },
                            { title: 'Liên hệ', links: ['Trợ giúp/FAQ', 'Báo chí', 'Đối tác'] },
                            { title: 'Thêm', links: ['Phí hàng không', 'Hãng bay', 'Mẹo tiết kiệm'] }
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
                        <p className="text-slate-400 text-sm font-medium">Bản quyền thuộc về @jadoo.co</p>
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
