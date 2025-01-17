import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Assets/logo-1.PNG";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import { HiOutlineBars3 } from "react-icons/hi2";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { FaSignOutAlt, FaUser, FaUserCog, FaBook, FaSignInAlt } from "react-icons/fa";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName"); // Fetch from localStorage
  const [openMenu, setOpenMenu] = useState(false);
  const email = localStorage.getItem("email");

  const menuOptions = [
    { text: "Home", icon: <HomeIcon />, link: "/" },
    { text: "About", icon: <InfoIcon />, link: "#about" },
    { text: "Bookcourse", icon: <FaBook />, link: "#bookcourse" },
    { text: "Testimonials", icon: <CommentRoundedIcon />, link: "#testimonials" },
    { text: "Contact", icon: <PhoneRoundedIcon />, link: "#contact" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/sign-in");
  };

  return (
    <nav style={{justifyContent: "space-between",alignItems: "center",display: openMenu ? "none" : "flex", backgroundColor: "#fff",}} >
      <div className="nav-logo-container">
        <Link to="/">
        <img src={Logo} alt="Logo" style={{ width: 'auto', height: '75px', position: 'relative', top: '1px' }} />
        </Link>
      </div>
      <div className="navbar-links-container" style={{ alignItems: "center", fontWeight: 'bold' }}>
      {menuOptions.map((item) => (
        <a key={item.text} href={item.link} style={{ textDecoration: "none", color: "#333", borderRadius: "5px", display: "inline-block" }}>
          {item.text}
        </a>
      ))}
        {firstName ? (
          <div style={{ display: "inline-block", color: "#333", textDecoration: "none", borderRadius: "5px", }} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <h3 onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer", color: "#333" , marginRight:'10px'}} >
              <FaUser /> Hi, {firstName}
            </h3>
            {dropdownOpen && (
              <div onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)} style={{ display: "inline-block", position: "absolute", backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "4px", overflow: "hidden", zIndex: "10", }}>
                {/* Admin Panel Link */}
                {email === "kunal@edumocks.com" && (
                  <Link to="/admin-panel" onClick={() => setDropdownOpen(false)}
                    style={{ display: "block", padding: "10px 20px", textDecoration: "none", color: "#333", backgroundColor: "#fff", textAlign: "left",}}>
                    <FaUserCog /> Admin Panel
                  </Link>
                )}

                {/* User Dashboard Link */}
                <Link to="/user-panel" onClick={() => setDropdownOpen(false)} style={{ display: "block", padding: "10px 20px", textDecoration: "none", color: "#333", backgroundColor: "#fff", textAlign: "left",}}>
                  <FaUserCog /> Dashboard
                </Link>

                {/* Logout Button */}
                <button className="primary-button" onClick={handleLogout} style={{ display: "block", padding: "10px 20px", backgroundColor: "#fff", border: "none", textAlign: "left", cursor: "pointer", }} >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/sign-in" className="primary-button" onClick={() => setDropdownOpen(false)} style={{textDecoration: "none", color: "#fff", backgroundColor: "#100B5C", borderRadius: "5px", border: "2px solid #C80D18", display: "inline-block"}}>
            Sign In
          </Link>
        )}
      </div>
      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} style={{marginRight: '20px' , color: "#100B5C"}}/>
      </div>
      <Drawer open={openMenu} onClose={() => setOpenMenu(false)} anchor="right">
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setOpenMenu(false)} onKeyDown={() => setOpenMenu(false)}>
          <List>
            {menuOptions.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component="a" href={item.link}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
            {firstName ? (
              <div style={{ display: "inline-block", color: "#333", borderRadius: "10px", textDecoration: "none" }} onMouseEnter={() => setDropdownOpen(true)} // Open dropdown on mouse hover
                onMouseLeave={() => setDropdownOpen(false)}>
                <h3 onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer", color: "#333" }} >
                  <FaUser style={{ color: "#C80D18" }} /> Hello, {firstName}
                </h3>
                {dropdownOpen && (
                  <div style={{  display: "inline-block",position: "absolute", backgroundColor: "white", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "4px", overflow: "hidden", zIndex: "10" }} 
                  onMouseEnter={(e) => (e.target.style.color = "#007BFF")}
                  onMouseLeave={(e) => (e.target.style.color = "#333")}>
                    {email === "kunal@edumocks.com" && (
                      <Link to="/admin-panel" onClick={() => setDropdownOpen(false)}
                        style={{ display: "block", padding: "20px 20px", textDecoration: "none", color: "#333", backgroundColor: "#fff", textAlign: "left",}}>
                        <FaUserCog /> Admin Panel
                      </Link>
                    )}
                    <Link to="/user-panel" onClick={() => setDropdownOpen(false)} style={{ display: "block", padding: "10px 20px", textDecoration: "none", color: "#333", backgroundColor: "#fff", textAlign: "left" }}>
                      <FaUserCog  /> Dashboard
                    </Link>
                    <button   onClick={handleLogout} style={{ display: "block", padding: "20px 20px", backgroundColor: "#fff", border: "none", textAlign: "left", cursor: "pointer" }}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/sign-in" className="secondary-button" >
                <FaSignInAlt /> Sign In
              </Link>
            )}
          </div>
        </Box>
      </Drawer>
    </nav>
  );
};

export default Navbar;