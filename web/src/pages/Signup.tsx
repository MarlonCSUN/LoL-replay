import * as React from "react";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { easeInOut, motion } from "framer-motion";

import bg from '../images/SignupBG.png';


export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [dPassword, setDpassword] = React.useState("");
    //const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { login } = useAuth();
    const nav = useNavigate();

    function onSubmit(e: FormEvent) {
        // CRUD operations here
        console.log("Test sumbit")
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
                bottom:"14%",
                right:"55%",
            }}
            initial={{ opacity: 0, y: 8, scale: 0.65 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
        >
            Share screenshots of your routes and tactics with your friends!
        </motion.h2>
        <motion.h2
            style={{
                position:"absolute",
                bottom:"60%",
                left:"65%"
            }}
            initial={{ opacity: 0, y: 8, scale: 0.65 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 2, ease: "easeInOut" }}
        >
            Event banners are colored to their respective team.
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
              
            >
              Sign up
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
                type="text"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
            />
          </div>
            <label htmlFor="password">
                  Re-Enter Password
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
                type="text"
                value={dPassword}
                placeholder="••••••••"
                onChange={(e) => setDpassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                    console.log("Input accepted")
                }}}
            />
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
                {loading ? "Creating..." : "Create"}
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
            <Link to="/" style={{fontWeight:"bold", paddingLeft:"8px"}}>Return to home</Link>
            <Link to="/login" style={{fontWeight:"bold", paddingLeft:"8px"}}>Have an account already?</Link>
          </div>
        </div>
      </main>
      
    </div>
    
    );
}