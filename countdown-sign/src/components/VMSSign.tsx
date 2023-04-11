import React from 'react';

interface VMSSignProps {
    dest1?: string; //fromDestination and toDestination maybe should be like Station type only? find this in NTT types.ts
    dest2?: string;
    time1?: string;
    time2?: string;
    clock?: string;    // clockTime should probably eventually be like DateTime or equivalent, just time no date
    text?: string;
    scale: number;
}

export const VMSSign: React.FC<VMSSignProps> = ({ dest1, dest2, time1, time2, clock, text, scale }) => {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return
        }
        const c = canvas.getContext("2d");
        if(!c) {
            return
        }
        c.fillStyle = "#201a1a";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.lineWidth = 8*scale;
        c.strokeStyle = "#000000";
        c.strokeRect(0,0,248*scale,40*scale);
        if (!text) { // if text is specified, then it will override, this checks if not there, and converts all the parts to a text message
            text = "";
            dest1 = trimString(dest1?dest1:"", 11); // this makes sure every string is exactly the right size
            dest2 = trimString(dest2?dest2:"", 11);
            time1 = trimString(time1?time1:"", 6, true);
            time2 = trimString(time2?time2:"", 6, true);
            clock = trimString(clock?clock:"", 5, true);
            text = dest1 + " " + time1 + " " + clock + dest2 + " " + time2;
        }
        text = trimString(text, 48); // 48 chars no matter what
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 24; j++) {
                drawCharacter(c, j, i, scale, text[i*24 + j]);
            }
        }
        runBlur(c, canvas.width, canvas.height, gaussBlur);
        console.timeEnd(text);
    }, [])

    return <canvas ref={canvasRef} width={248*scale} height={40*scale}></canvas>;
}

const noneFilter = [[1]];
const basicBlur = [[1/9, 1/9, 1/9],[1/9, 1/9, 1/9],[1/9, 1/9, 1/9]];
const otherBlur = [ [1/16, 2/16, 1/16], [2/16, 4/16, 2/16], [1/16, 2/16, 1/16] ];
const bigBlur = [[1/25,1/25,1/25,1/25,1/25],[1/25,1/25,1/25,1/25,1/25],[1/25,1/25,1/25,1/25,1/25],[1/25,1/25,1/25,1/25,1/25],[1/25,1/25,1/25,1/25,1/25]];
const gaussBlur =[[0.0038, 0.0150, 0.0238, 0.0150, 0.0038],
[0.0150, 0.0599, 0.0949, 0.0599, 0.0150],
[0.0238, 0.0949, 0.1503, 0.0949, 0.0238],
[0.0150, 0.0599, 0.0949, 0.0599, 0.0150],
[0.0038, 0.0150, 0.0238, 0.0150, 0.0038]]; //http://demofox.org/gauss.html

const runBlur = (c: CanvasRenderingContext2D, width: number, height: number, weights: number[][]) => {
    var canvasData = c.getImageData(0, 0, width, height)
    var actualData = canvasData.data;
    var data = new Uint8ClampedArray(actualData);
    for (var y = 0; y < height; y ++) { // theres R G B A in order
        for (var x = 0; x < width; x ++) {
            var i = 4*(y * width + x);
            var rgb = [actualData[i], actualData[i+1], actualData[i+2]];
            var convSide = weights.length;
            var convHalfSide = Math.floor(convSide/2);
            for (var colorIndex = 0; colorIndex < 3; colorIndex ++) {
                var index = i + colorIndex;
                var sum = 0;
                for (var convY = 0; convY < convSide; convY ++) { //MAKE THIS CHANGE BASED ON CONVOLUTION ARRAY DIMENSIONS
                    for (var convX = 0; convX < convSide; convX ++) {
                        sum += weights[convY][convX] * actualData[4*((y+convY-convHalfSide)*width+(x+convX-convHalfSide))+colorIndex];
                    }
                }
                rgb[colorIndex] = sum;
            }
            
            data[i] = rgb[0];
            data[i+1] = rgb[1];
            data[i+2] = rgb[2];
        }
    }
    for (let i = 0; i < actualData.length; i++) {
        actualData[i] = actualData[i] > data[i] ? actualData[i] : data[i];
    }
    c.putImageData(canvasData, 0, 0);
}

const drawCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, character: string) => {
    if (!(charOrder.indexOf(character)+1)) {
        character = "�";
    }
    var currentChar = chars[charOrder.indexOf(character)]

    //ctx.shadowBlur = 10;
    //ctx.shadowColor = "#FFCC00";
    for (var i = 0; i < 16; i++) {
        for (var j = 0; j < 10; j++) {
            if (currentChar[i*10 + j] == "1") {
                drawDot(ctx, x*10 + j, y*16 + i, scale);
            }
        }
    }
    //ctx.shadowBlur = 0;
}

const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.beginPath();
    ctx.ellipse((x+4.5)*scale, (y+4.5)*scale, 0.5*scale, 0.5*scale, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFCC00"
    ctx.fill();
}

const trimString = (text: string, length: number, trimLeft?: boolean) => {
    text = text.substring(0, length); //truncate text if too long. for now!! later it should add to multiple messages???? also should maybe include line breaks at spaces?
    if (!trimLeft) {
        text = text + " ".repeat(length - text.length); // add spaces to bring it up to length        
    } else {
        text = " ".repeat(length - text.length) + text; // or on the left
    }
    return text;
}

const charOrder = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",":"," ", ".", ",", "+", "(", ")", "/", "�"];

// this is generated directly from extractfont.py, just copied and pasted
// there is almost certainly a better way to do this but i dont super want to bother with Actual binary, it would probably need BigInteger or something
const chars = ['0001111100001111111001110001110110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110111000111001111111000011111000000000000', '0000110000000111000000111100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000001111110000111111000000000000', '0001111100001111111001110001110110000011000000011100000011100000001110000001110000001110000000111000000111000000111000000111000000011111111101111111110000000000', '0001111100001111111001110001110110000011000000011100000001110000111110000011110000000001100000000011000000001101100000110111000111001111111000011111000000000000', '0000000110000000111000000111100000110110000110011000110001100110000110011111111101111111110000000110000000011000000001100000000110000000011000000001100000000000', '0111111111011111111101100000000110000000011000000001101111000111111110011100011100000000110000000011000000001100000000110111000111001111111000011111000000000000', '0001111100001111111001110001110110000011011000000001100000000110111100011111111001110001110110000011011000001101100000110111000111001111111000011111000000000000', '0111111111011111111100000000110000000110000000011000000011000000001100000000110000000110000000011000000011000000001100000000110000000011000000001100000000000000', '0001111100001111111001110001110110000011011000001101110001110011111110000111110000110001100110000011011000001101100000110111000111001111111000011111000000000000', '0001111100001111111001110001110110000011011000001101100000110111000111001111111100011110110000000011000000001101100000110111000111001111111000011111000000000000', '0001111100001111111001110001110110000011011000001101100000110110000011011111111101111111110110000011011000001101100000110110000011011000001101100000110000000000', '0111111100011111111001100001110110000011011000001101100001100111111100011111111001100001110110000011011000001101100000110110000111011111111001111111000000000000', '0001111100001111111001110001110110000011011000000001100000000110000000011000000001100000000110000000011000000001100000110111000111001111111000011111000000000000', '0111111100011111111001100001110110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110110000111011111111001111111000000000000', '0111111111011111111101100000000110000000011000000001100000000111111110011111111001100000000110000000011000000001100000000110000000011111111101111111110000000000', '0111111111011111111101100000000110000000011000000001100000000111111110011111111001100000000110000000011000000001100000000110000000011000000001100000000000000000', '0001111100001111111001110001110110000000011000000001100000000110001111011000111101100000110110000011011000001101100000110111000111001111111000011111000000000000', '0110000011011000001101100000110110000011011000001101100000110111111111011111111101100000110110000011011000001101100000110110000011011000001101100000110000000000', '0111111110011111111000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000011111111001111111100000000000', '0111111111011111111100000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000110011000011111100000111100000000000000', '0110000001011000001101100001110110001110011001110001101110000111110000011110000001111100000110111000011001110001100011100110000111011000001101100000010000000000', '0110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011111111101111111110000000000', '0100000001011000001101110001110111101111011111111101101110110110010011011000001101100000110110000011011000001101100000110110000011011000001101100000110000000000', '0110000011011100001101110000110111100011011110001101111100110110110011011011101101100110110110011111011000111101100011110110000111011000011101100000110000000000', '0001111100001111111001110001110110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110111000111001111111000011111000000000000', '0111111100011111111001100001110110000011011000001101100001110111111110011111110001100000000110000000011000000001100000000110000000011000000001100000000000000000', '0001111100001111111001110001110110000011011000001101100000110110000011011000001101100000110110000011011000001101100001110111001110001111111100011110110000000000', '0111111100011111111001100001110110000011011000001101100001110111111110011111110001100011100110000111011000001101100000110110000011011000001101100000110000000000', '0001111100001111111001110001110110000011011000001101110000000011111100000111111000000001110000000011000000001101100000110111000111001111111000011111000000000000', '0111111110011111111000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110111000111001111111000011111000000000000', '0110000011011000001101100000110110000011011000001101100000110110000011011000001101100000110110000011011100011100111011100001111100000011100000000100000000000000', '0110000011011000001101100000110110000011011000001101100000110110000011011000001101100100110110111011011111111101111011110111000111011000001101000000010000000000', '0110000011011000001101100000110110000011001100011000011011000000111000000011100000011011000011000110011000001101100000110110000011011000001101100000110000000000', '0110000110011000011001100001100011001100001100110000011110000001111000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0111111111011111111100000000110000000110000000110000000011000000011000000011000000011000000001100000001100000001100000000110000000011111111101111111110000000000', '0000000000000000000000000000000000000000000111111000111111110000000011000000001100011111110011111111011100001101100000110110000011001111111100011110110000000000', '0110000000011000000001100000000110000000011011110001111111100111000110011000001101100000110110000011011000001101100000110111000110011111111001101111000000000000', '0000000000000000000000000000000000000000000111111000111111110111000011011000000001100000000110000000011000000001100000000111000011001111111100011111100000000000', '0000000011000000001100000000110000000011000111101100111111110111000111011000001101100000110110000011011000001101100000110111000111001111111100011110110000000000', '0000000000000000000000000000000000000000000111110000111111100111000111011000001101111111110111111110011000000001100000000111000000001111111100011111100000000000', '0000011110000011111100001100110000110000001111111000111111100000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0000000000000000000000000000000000000000001111111001111111110110000011011000001101100000110111111111001111111100000000110110000011011111111100111111100000000000', '0110000000011000000001100000000110000000011011110001111111100111000111011000001101100000110110000011011000001101100000110110000011011000001101100000110000000000', '0000110000000011000000000000000000000000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0000110000000011000000000000000000000000000011000000001100000000110000000011000000001100000000110000000011000000001100000110110000011111000000111000000000000000', '0110000000011000000001100000000110000000011000111001100111000110111000011111000001111000000111100000011111000001101110000110011100011000111001100001110000000000', '0000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0000000000000000000000000000000000000000011100011101111011110111111111011011101101100100110110010011011001001101100100110110010011011001001101100100110000000000', '0000000000000000000000000000000000000000011011110001111111100111000111011000001101100000110110000011011000001101100000110110000011011000001101100000110000000000', '0000000000000000000000000000000000000000000111110000111111100111000111011000001101100000110110000011011000001101100000110111000111001111111000011111000000000000', '0000000000000000000000000000000000000000011011110001111111100111000111011000001101100000110111000111011111111001101111000110000000011000000001100000000000000000', '0000000000000000000000000000000000000000000111101100111111110111000111011000001101100000110111000111001111111100011110110000000011000000001100000000110000000000', '0000000000000000000000000000000000000000011011110001111111100111000111011000001101100000000110000000011000000001100000000110000000011000000001100000000000000000', '0000000000000000000000000000000000000000001111111001111111110110000011011000000001111111100011111111000000001100000000110110000011011111111100111111100000000000', '0000110000000011000000001100000000110000011111111001111111100000110000000011000000001100000000110000000011000000001100000000110000000011000000001100000000000000', '0000000000000000000000000000000000000000011000001101100000110110000011011000001101100000110110000011011000001101100000110111000111001111111100011110110000000000', '0000000000000000000000000000000000000000011000001101100000110110000011011000001101100000110110000011011100011100111011100001111100000011100000000100000000000000', '0000000000000000000000000000000000000000011000001101100000110110000011011000001101100000110110000011011001001101101110110111101111011100011101100000110000000000', '0000000000000000000000000000000000000000011000001101100000110110000011011100011100111011100001111100001110111001110001110110000011011000001101100000110000000000', '0000000000000000000000000000000000000000011000001101100000110110000011011000001101110001110011111111000111111100000000110110000011011111111000111111000000000000', '0000000000000000000000000000000000000000011111111101111111110000000111000000111000000111000000111000000111000000111000000111000000011111111101111111110000000000', '0000000000000000000000000000000000000000000110000000011000000001100000000000000000000000000000000000000110000000011000000001100000000000000000000000000000000000', '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011100000001110000000111000000000000000', '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000110000000011000000000100000000100000000000000000', '0000000000000000000000000000000000000000000011000000001100000000110000000011000001111111100111111110000011000000001100000000110000000011000000000000000000000000', '0000000111000000110000000110000000110000000011000000011000000001100000000110000000011000000001100000000011000000001100000000011000000000110000000001110000000000', '0111000000000110000000001100000000011000000001100000000011000000001100000000110000000011000000001100000001100000000110000000110000000110000001110000000000000000', '0000000011000000011000000001100000001100000000110000000110000000011000000011000000001100000001100000000110000000110000000011000000011000000001100000000000000000', '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'];