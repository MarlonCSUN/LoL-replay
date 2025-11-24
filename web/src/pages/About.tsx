import * as React from "react";
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { easeInOut, motion } from "framer-motion";

import csunPic from '../images/SignupBG.png';
import somethingPic from '../images/SignupBG.png';
import { aside } from "framer-motion/client";


export default function About() {
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
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "550px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
        <img
        src={csunPic}
        style={{
            width: "100%",
            maxHeight: "100%",
            //backgroundColor: "#98a900ff",
            borderRadius: "16px",
            border: "1px solid #4a4a4a",
            margin: "2.67% 2.67% 2.67% 2.67%",

        }}
        />
        <motion.h2
                initial={{ opacity: 0, y: 8, scale:2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay:1, ease: "easeInOut" }}
        >
           About that Something 
        </motion.h2>
        <h3>Maybe about something league related to us? Have maybe three+ more scentences.</h3>
        </div>
        </main>

        {/* Right Panel */}

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
            maxWidth: "550px",
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
           About Us 
        </motion.h2>
        <h3>pawoiegpawoegg awpeogiajwepgoiawjepg oiwejgaoisjdfg akdjg aow ga weog awepgjaoisdg aspdg aowiejg powiegj powegj aosdjgp aoskdjgp ohwpg owhego iwehpgo iwehgpoaiwehgoiawe hg Also include riot api as a reference.</h3>
        <img
        src={somethingPic}
        style={{
            width: "100%",
            maxHeight: "100%",
            //backgroundColor: "#98a900ff",
            borderRadius: "16px",
            border: "1px solid #4a4a4a",
            margin: "6.7% 2.67% 2.67% 2.67%",

        }}
        />
        
        </div>
        </main>
    </div>
    
    );
}