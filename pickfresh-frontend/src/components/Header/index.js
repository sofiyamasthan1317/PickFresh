import { useNavigate } from "react-router-dom";
import './index.css'
import logo from './pickfresh_logo.png'
import { FiShoppingCart } from "react-icons/fi"
const Header = () => {
    const navigate = useNavigate();
    return (
        <div className='header'>
            <img onClick={() => navigate("/")} src={logo} alt="logo" className='logo' />
            <button onClick={() => navigate("/cart")} className='cart-btn'>
               <FiShoppingCart color="#ffffff" size={22} />
            </button>
        </div>
    )

}

export default Header