
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navLinks = ['Home', 'Products', 'Deals', 'About Us', 'Contact'];

    const navigate = useNavigate();

    function handleNav(navLink) {
        if (navLink === 'Home') {
            navigate('/');
        } else {
            navigate(`/${navLink.toLowerCase().trim()}`);
        }
    }

    return (
        <nav className="px-3 sm:px-8 lg:px-20 border-b border-gray-300">
            <div className="flex items-center gap-6 md:gap-10 text-xs md:text-base overflow-x-auto">
                {navLinks.map((navLink) => (
                    <button
                        onClick={() => handleNav(navLink)}
                        key={navLink}
                        className="shrink-0 py-3 cursor-pointer hover:text-[#245C45]"
                    >
                        {navLink}
                    </button>
                ))}
            </div>
        </nav>
    );
}

export default Navbar;
