import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import title from '../images/LoL-Title.png';
import banner from '../images/LoL-Banner.png';


export default function Login() {
    const [name, setName] = useState("");
      const { login } = useAuth();
      const nav = useNavigate();
    
      function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        login(name.trim());
        nav("/replay");
      }



    return(
        <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>
            <Link to="/">
                <img src={title}
                style={{
                    height: "20vh",
                    width: "auto"
                }}>
                </img>
            </Link>
            {/* banner */}
            <img src={banner}
            style={{
                height: "50vh",
                width: "auto"
            }}>
            </img>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <h2>Username:</h2>
                <input
                type="text"
                value={name}
                placeholder="LoL-Lover"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
                />
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <h2>Password:</h2>
                <input
                type="text"
                placeholder="********"
                /*onChange={(e) => setSearchInput(e.target.value)}*/
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")}}}
                />
            </div>
            <form onSubmit={onSubmit}>
            <button type="submit">
                Log In
            </button>
            </form>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                <h3>Don't have an account? Create one</h3>
                <Link to="/signup" style={{fontWeight:"bold", paddingLeft:"8px"}}>here</Link>
                <h3>!</h3>
            </div>
            
            
        </div>
    );
}