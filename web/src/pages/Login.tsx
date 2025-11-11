import * as React from "react";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { easeInOut, motion } from "framer-motion";

import title from '../images/LoL-Title.png';
import banner from '../images/LoL-Banner.png';
import bg from '../images/LoginBG.png';


export default function Login() {
    const [name, setName] = useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { login } = useAuth();
    const nav = useNavigate();

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        login(name.trim());
        nav("/replay");
    }



    return(
        <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#282831ff",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* Left panel */}
      <aside
        style={{
          display: "block",
          backgroundColor: "#282831ff",
          borderTopRightRadius: "24px",
          borderBottomRightRadius: "24px",
          alignItems: "center",
          justifyContent: "center",
          position:"relative",
        }}
        className="left-panel"
      >
        <img
        src={bg}
        style={{
            width: "100%",
            maxHeight: "100%",
            //backgroundColor: "#98a900ff",
            borderRadius: "16px",
            border: "1px solid #4a4a4a",
            margin: "6.7% 2.67% 2.67% 2.67%",

        }}
        />
        <motion.h2
            style={{
                position:"absolute",
                bottom:"55%",
                right:"65%",
            }}
            initial={{ opacity: 0, y: 8, scale: 0.65 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
        >
            Make every League match instantly replayable, searchable, and shareable!
        </motion.h2>
        <motion.h2
            style={{
                position:"absolute",
                bottom:"20%",
                left:"65%"
            }}
            initial={{ opacity: 0, y: 8, scale: 0.65 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
        >
            Sign in to save your Riot ID for quicker replay access!
        </motion.h2>
        
        </aside>
        

      {/* Right panel */}
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <motion.h2
              initial={{ opacity: 0, y: 8, scale:2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              
              //className="mb-8 text-center text-3xl font-semibold"
            >
              Log In
        </motion.h2>
          
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <label htmlFor="email">
                  Email
            </label>
            <input
                style={{
                    width:"80%",
                    height:"100%",
                    padding:"12px 50px 12px 12px",
                    fontSize:"40" // doesn't work
                }}
                type="text"
                value={name}
                placeholder="leaguelover@example.com"
                autoComplete="email"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    setName(name)
                    console.log("Input accepted")
                }}}
            />
            <label htmlFor="password">
                  Password
            </label>
            <div
            style={{
              position:"relative"
            }}
          >
            
            <input
            id="password"
                style={{
                    width:"80%",
                    height:"100%",
                    padding:"12px 50px 12px 12px",
                    fontSize:"40" // doesn't work
                }}
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
            />
            <motion.button
                style={{
                    position:"absolute",
                    right:"10px",
                    top:"7%",
                    scale:0.8
                }}
                whileTap={{ scale: 0.75 }}
                type="button"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
            </motion.button>
          </div>
          </div>

          <form onSubmit={onSubmit} style={{
            position:"relative",
            alignItems:"center"
          }}>
            <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                //className="mx-auto flex w-40 items-center justify-center rounded-2xl bg-zinc-200 px-5 py-3 font-medium text-zinc-900 transition hover:bg-white disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign In"}
            </motion.button>
            </form>
          
            
            {/* Links */}
          <div
            style={{
              marginTop: "40px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              textAlign: "center",
            }}
          >
            <Link to="/signup" style={{fontWeight:"bold", paddingLeft:"8px"}}>Signup Options</Link>
            <Link to="/signup" style={{fontWeight:"bold", paddingLeft:"8px"}}>Forgot Password?</Link>
          </div>
        </div>
      </main>
      
    </div>
    
    );
}