import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import title from '../images/LoL-Title.png';
import banner from '../images/LoL-Banner2.jpg';


export default function Signup() {
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
                height: "35vh",
                width: "auto"
            }}>
            </img>
            
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px", width:"30%"}}>
                <h2>Username:</h2>
                <h1></h1>
                <input
                type="text"
                //value={name}
                placeholder="LoL-Lover"
                //onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
                />
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px", width:"20%"}}>
                <h2>Email:</h2>
                <h1></h1>
                <input
                type="text"
                //value={name}
                placeholder="lolplayer12345@email.com"
                //onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
                />
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px", width:"25%"}}>
                <h2>Password:</h2>
                <h1></h1>
                <input
                type="text"
                placeholder="Must have 1 special character"
                /*onChange={(e) => setSearchInput(e.target.value)}*/
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")}}}
                />
            </div>

            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px", width:"50%"}}>
                <h2>Re-Input Password:</h2>
                <h1></h1>
                <input
                type="text"
                placeholder="..."
                /*onChange={(e) => setSearchInput(e.target.value)}*/
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")}}}    
                />
            </div>
            
            <button>
                Create Account
            </button>
           
            <div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                <h3>Already have an account? Login </h3>
                <Link to="/login" style={{fontWeight:"bold", paddingLeft:"8px"}}>here</Link>
                <h3>!</h3>
            </div>
            
            
        </div>
    );
}