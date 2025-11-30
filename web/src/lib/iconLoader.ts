const iconCache = new Map<string, HTMLImageElement>();


export type IconType = 
| "tower-blue"
| "tower-red"
| "inhibitor-blue"
| "inhibitor-red"
| "nexus-blue"
| "nexus-red"
| "baron"
| "dragon"
| "herald";

const ICON_URLS: Record<IconType, string> = {

//Tower icons
"tower-blue": "/assets/icons/tower-blue.png",
"tower-red": "/assets/icons/tower-red.png",

//Inhibitor icons
"inhibitor-blue": "/assets/icons/inhibitor-blue.png",
"inhibitor-red": "/assets/icons/inhibitor-red.png",

// Nexus icons
"nexus-blue": "/assets/icons/nexus-blue.png",
"nexus-red": "/assets/icons/nexus-red.png",

//Objective icons
"dragon": "/assets/icons/dragon.png",
"baron": "/assets/icons/baron.png",
"herald": "/assets/icons/herald.png",
};

const DATA_DRAGON_VERSION = "14.1.1";
const ALTERNATIVE_URLS: Record<IconType, string> = {

"tower-blue": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"tower-red": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"dragon": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"baron": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"herald": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"inhibitor-blue": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"inhibitor-red": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"nexus-blue": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,
"nexus-red": `https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/img/sprite/spell0.png`,    
};

export function loadIcon(
    type: IconType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fallbackColor?: string
): HTMLImageElement | null {

    // Check cache first
    if (iconCache.has(type)) {
        return iconCache.get(type)!;
    }

    const img = new Image();

    img.src = ICON_URLS[type];
    
    img.onerror = () => {
        console.warn(`Failed to load icon ${type} at ${ICON_URLS[type]},`);
        img.src = ALTERNATIVE_URLS[type];
    };

    // Cache immediately
    iconCache.set(type, img);
    return img;
}

// function for fallback in case both URLs fail
export function drawFallbackIcon(
    ctx: CanvasRenderingContext2D,
    type: IconType,
    x: number,
    y: number,
    size: number = 20
) {
    ctx.save();
    ctx.translate(x, y);

    if (type.includes("tower")) {
        // Draw simple tower shape
        const color = type.includes("blue") ? "#3B82F6" : "#EF4444";

        ctx.fillStyle = "#fff";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Tower base
        ctx.beginPath();
        ctx.rect(-size/4, -size/2, size/2, size * 0.7);
        ctx.fill();
        ctx.stroke();

        // Tower top
        ctx.beginPath();
        ctx.moveTo(-size/3, -size/2);
        ctx.lineTo(0, -size * 0.7);
        ctx.lineTo(size/3, -size/2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

} else if (type.includes("dragon")) {
    // simple dragon icon with D
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fillStyle = "#0a7030ff";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("D", 0, 0);

} else if (type.includes("baron")) {
    // simple baron icon with B
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fillStyle = "#8b5cf6";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("B", 0, 0);

} else if (type.includes("herald")) {
    // simple herald icon with H
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fillStyle = "#eb04ebff";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("H", 0, 0);

} else if (type.includes("inhibitor")) {
    const color = type.includes("blue") ? "#3B82F6" : "#EF4444";

    ctx.beginPath();
    ctx.moveTo(0, -size/2);
    ctx.lineTo(size/3, 0);
    ctx.lineTo(0, size/2);
    ctx.lineTo(-size/3, 0);
    ctx.closePath();
    
    ctx.fillStyle = color + "40"; // Semi-transparent
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  ctx.restore();
}

// Function to draw icon with fallback
export function drawIconOrFallback(
    ctx: CanvasRenderingContext2D,
    type: IconType,
    x: number,
    y: number,
    size: number = 20
) {
      console.log(`drawIconOrFallback called: type=${type}, x=${x}, y=${y}, size=${size}`);
  
    const img = loadIcon(type);

    if (img && img.complete && img.naturalWidth > 0) {
        // Will draw the actual icon if loaded
        ctx.drawImage(
            img,
            x - size / 2,
            y - size / 2,
            size,
            size
        );
    } else {
        // Draw fallback if image not loaded
        drawFallbackIcon(ctx, type, x, y, size);
    }
}

// Clear the icon cache 
export function clearIconCache() {
    iconCache.clear();
}

// Preload all icons for faster access later
export function preloadAllIcons() {
    const types: IconType[] = [
        "tower-blue",
        "tower-red",
        "inhibitor-blue",
        "inhibitor-red",
        "baron",
        "dragon",
        "herald"
    ];
    types.forEach(type => loadIcon(type));
}
        