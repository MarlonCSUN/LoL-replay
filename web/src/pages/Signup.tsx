import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import title from '../images/LoL-Title.png';
import banner from '../images/LoL-Banner2.jpg';


export default function Signup() {
    return(
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:"32px"}}>
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
            
            <h3>Create an Account</h3>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <input
                style={{width:"300px", height:"25px"}}
                type="text"
                //value={name}
                placeholder="Username"
                //onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
                />
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <input
                style={{width:"300px", height:"25px"}}

                type="text"
                //value={name}
                placeholder="Email"
                //onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
                />
            </div>
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <input
                style={{width:"300px", height:"25px"}}

                type="text"
                placeholder="Password"
                /*onChange={(e) => setSearchInput(e.target.value)}*/
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")}}}
                />
            </div>
            
            <div style={{display:"flex", flexDirection:"row", alignItems:"center", gap:"15px"}}>
                <input
                style={{width:"300px", height:"25px"}}

                type="text"
                placeholder="Re-Enter Password"
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