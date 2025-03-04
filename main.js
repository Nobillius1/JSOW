const prompt = require('prompt-sync')();
const {objects , emptyInventory , items , functions} = require('./data.js')();
let {chunkSize} = require('./data.js');
let classes = ["knight","assassin","mage","ranger"];
let world = [];
chunkSize = 3;
let worldSizeX = 0;
let worldSizeY = 0;
let worldScale = 1;
worldScale = prompt("World Scale:")
worldSizeX = 3*worldScale*chunkSize;
worldSizeY = 3*worldScale*chunkSize;
let row = [];
let player = {
  Name : "Bob",
  Avatar : {
    tile:"",
    tileOn:"",
    tileOnOld:""
  },
  ClassIndex : 5,
  Xp : 0.0,
  Class : function() {
    let Index = (this.ClassIndex-1) % 4;
    return classes.at(Index);
  },
  coordinatesX:4,
  coordinatesY:4,
  coordinatesXold:0,
  coordinatesYold:0,
  chunkCoordinatesX:1,
  chunkCoordinatesY:1,
  chunkCoordinatesXold:0,
  chunkCoordinatesYold:0,
  debug:false,
  inventory: [ ...emptyInventory ],
  selectedSlot: {}
};
player.chunkCoordinatesX = (player.coordinatesX-(player.coordinatesX%chunkSize))/chunkSize;
player.chunkCoordinatesY = (player.coordinatesY-(player.coordinatesY%chunkSize))/chunkSize;
player.Name = prompt("Name:");
player.Avatar.tile = "["+player.Name.at(0).toUpperCase()+"]";
player.Avatar.tileImageName = "player.png";
player.ClassIndex = prompt("Class(1-4):");

function generateObjectFill(object) {
  for (let i = 0;i < worldSizeY/chunkSize;i++) {
    world.push([])
    for (let j = 0;j < worldSizeX/chunkSize;j++) {
      world.at(i).push([])
      for (let k = 0;k < chunkSize;k++) {
        world.at(i).at(j).push([])
        for (let l = 0;l < chunkSize;l++) {
          let tile = { ...object };
          tile.coordinates = {
            x:(j*chunkSize)+l,
            y:(i*chunkSize)+k
          }
          world.at(i).at(j).at(k).push(tile)
        };
      };
    };
    
  };
};

function generateObjectRandom(object,math) {
  for (let i = 0;i < (worldScale**2)*eval(math);i++) {
    let a = Math.floor(Math.random()*3*worldScale);
    let b = Math.floor(Math.random()*3*worldScale);
    let c = Math.floor(Math.random()*chunkSize);
    let d = Math.floor(Math.random()*chunkSize);
    let tile = { ...object }
    tile.coordinates = {
      x:(b*chunkSize)+d,
      y:(a*chunkSize)+c
    };
    world.at(a).at(b).at(c).splice(d,1,tile)
  };
};

function generateObjectArea(object,xS,yS,xE,yE) {
  for (let y = yS;y <= yE;y++) {
    const chunkY = Math.floor(y/chunkSize);
    const yR = y%chunkSize;
    for (let x = xS;x <= xE;x++) {
      const chunkX = Math.floor(x/chunkSize);
      const xR = x%chunkSize;
      let tile = { ...object };
      tile.coordinates = {
        x:x,
        y:y
      };
      if (x < worldSizeX && y < worldSizeY) {
        world.at(chunkY).at(chunkX).at(yR).splice(xR,1,tile)
      }
      else if (x >= worldSizeX && y >= worldSizeY) {
        break;
      };
    };
  };
};

function generateObjectAreaAtRandom(object,xS,yS,xR,yR) {
  const xSStable = eval(xS);
  const ySStable = eval(yS);
  const xRStable = eval(xR);
  const yRStable = eval(yR);
  for (let y = ySStable;y <= ySStable+yRStable;y++) {
    const chunkY = Math.floor(y/chunkSize);
    const yC = y%chunkSize;
    for (let x = xSStable;x <= xSStable+xRStable;x++) {
      const chunkX = Math.floor(x/chunkSize);
      const xC = x%chunkSize;
      let tile = { ...object };
      tile.coordinates = {
        x:x,
        y:y
      };
      if (x < worldSizeX && y < worldSizeY) {
        world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
      }
      else if (x >= worldSizeX && y >= worldSizeY) {
        break;
      };
    };
  };
};

function generateObjectAreasAtRandom(object,math,xS,yS,xR,yR) {
  for (let i = 0;i < Math.floor((worldScale**2)*eval(math));i++) {
    const xSStable = eval(xS);
    const ySStable = eval(yS);
    const xRStable = eval(xR);
    const yRStable = eval(yR);
    for (let y = ySStable;y <= ySStable+yRStable;y++) {
    const chunkY = Math.floor(y/chunkSize);
    const yC = y%chunkSize;
    for (let x = xSStable;x <= xSStable+xRStable;x++) {
      const chunkX = Math.floor(x/chunkSize);
      const xC = x%chunkSize;
      let tile = { ...object };
      tile.coordinates = {
        x:x,
        y:y
      };
      if (x < worldSizeX && y < worldSizeY) {
        world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
      }
      else if (x >= worldSizeX && y >= worldSizeY) {
        break;
      };
    };
  };
  }
};

function generateObjectRandomArea(object,xS,yS,xE,yE,randomType,density) {
  for (let y = eval(yS);y <= eval(yE);y++) {
    const chunkY = Math.floor(y/chunkSize);
    const yR = y%chunkSize;
    for (let x = eval(xS);x <= eval(xE);x++) {
      const chunkX = Math.floor(x/chunkSize);
      const xR = x%chunkSize;
      let tile = { ...object };
      tile.coordinates = {
        x:x,
        y:y
      };
      if (x < worldSizeX && y < worldSizeY) {
        if (randomType == "circle") {
          const centerX = (eval(xS)+eval(xE))/2;
          const centerY = (eval(yS)+eval(yE))/2;
          const sizeX = Math.abs(eval(xS)-eval(xE));
          const sizeY = Math.abs(eval(yS)-eval(yE));
          const radius = Math.sqrt((x-centerX)**2+(y-centerY)**2);
          const odd = 10*sizeX*sizeY/radius**2;
          if (Math.random()*101 <= odd) {
            world.at(chunkY).at(chunkX).at(yR).splice(xR,1,tile)
          }
          else {};
        }
        else if (randomType == "forest") {
          if (Math.random()*150 <= eval(density)) {
            world.at(chunkY).at(chunkX).at(yR).splice(xR,1,tile)
          }
          else {};
        };
      }
      else if (x >= worldSizeX && y >= worldSizeY) {
        break;
      };
    };
  };
};

function generateObjectRandomAreaAtRandom(object,xS,yS,xR,yR,randomType,density) {
  const xSStable = eval(xS);
  const ySStable = eval(yS);
  const xRStable = eval(xR);
  const yRStable = eval(yR);
  for (let y = ySStable;y <= ySStable+yRStable;y++) {
    const chunkY = Math.floor(y/chunkSize);
    const yC = y%chunkSize;
    for (let x = xSStable;x <= xSStable+xRStable;x++) {
      const chunkX = Math.floor(x/chunkSize);
      const xC = x%chunkSize;
      let tile = { ...object };
      tile.coordinates = {
        x:x,
        y:y
      };
      if (x < worldSizeX && y < worldSizeY) {
        if (randomType == "circle") {
          const centerX = (2*xSStable+xRStable)/2;
          const centerY = (2*ySStable+yRStable)/2;
          const sizeX = Math.abs(xRStable);
          const sizeY = Math.abs(yRStable);
          const radius = Math.sqrt((x-centerX)**2+(y-centerY)**2);
          const odd = 10*sizeX*sizeY/radius**2;
          if (Math.random()*101 <= odd) {
            world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
          }
          else {};
        }
        else if (randomType == "forest") {
          if (Math.random()*150 <= eval(density)) {
            world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
          }
          else {};
        };
      }
      else if (x >= worldSizeX && y >= worldSizeY) {
        break;
      };
    };
  };
};

function generateObjectRandomAreasAtRandom(object,math,xS,yS,xR,yR,randomType,density) {
  for (let i =0;i < Math.ceil((worldScale**2)*eval(math));i++) {
    const xSStable = eval(xS);
    const ySStable = eval(yS);
    const xRStable = eval(xR);
    const yRStable = eval(yR);
    for (let y = ySStable;y <= ySStable+yRStable;y++) {
      const chunkY = Math.floor(y/chunkSize);
      const yC = y%chunkSize;
      for (let x = xSStable;x <= xSStable+xRStable;x++) {
        const chunkX = Math.floor(x/chunkSize);
        const xC = x%chunkSize;
        let tile = { ...object };
        tile.coordinates = {
          x:x,
          y:y
        };
        if (x < worldSizeX && y < worldSizeY) {
          if (randomType == "circle") {
            const centerX = (2*xSStable+xRStable)/2;
            const centerY = (2*ySStable+yRStable)/2;
            const sizeX = Math.abs(xRStable);
            const sizeY = Math.abs(yRStable);
            const radius = Math.sqrt((x-centerX)**2+(y-centerY)**2);
            const odd = 10*sizeX*sizeY/radius**2;
            if (Math.random()*101 <= odd) {
              world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
            }
            else {};
          }
          else if (randomType == "forest") {
            if (Math.random()*150 <= eval(density)) {
              world.at(chunkY).at(chunkX).at(yC).splice(xC,1,tile)
            }
            else {};
          };
        }
        else if (x >= worldSizeX && y >= worldSizeY) {
          break;
        };
      };
    };
  };
};

function createWorld() {
  const naturalObjects = [];
  objects.forEach(obj => {
    if (obj.generation.isNatural) {
      naturalObjects.push({ ...obj })
    }
  });
  const layers = [];
  naturalObjects.forEach(obj => {
    if (!layers.includes(obj.generation.layer)) {
      layers.push(obj.generation.layer)
    }
  });
  layers.sort((a,b) => {return a-b});
  layers.forEach(layer => {
    const layerObjects = naturalObjects.filter(obj => obj.generation.layer == layer);
    layerObjects.forEach(obj => {
      const objectRule = obj.generation.rule;
      if (objectRule.type == "fill") {
        generateObjectFill(obj)
      }
      else if (objectRule.type == "random") {
        generateObjectRandom(obj,objectRule.math)
      }
      else if (objectRule.type == "area"){
        const coords = objectRule.coordinates;
        generateObjectArea(obj,coords.xS,coords.yS,coords.xE,coords.yE)
      }
      else if (objectRule.type == "areaAtRandom"){
        const coords = objectRule.coordinates;
        generateObjectAreaAtRandom(obj,coords.xS,coords.yS,coords.xR,coords.yR)
      }
      else if (objectRule.type == "areasAtRandom"){
        const coords = objectRule.coordinates;
        generateObjectAreasAtRandom(obj,objectRule.math,coords.xS,coords.yS,coords.xR,coords.yR)
      }
      else if (objectRule.type == "randomArea"){
        const coords = objectRule.coordinates;
        generateObjectRandomArea(obj,coords.xS,coords.yS,coords.xE,coords.yE,coords.randomType,coords.density)
      }
      else if (objectRule.type == "randomAreaAtRandom"){
        const coords = objectRule.coordinates;
        generateObjectRandomAreaAtRandom(obj,coords.xS,coords.yS,coords.xR,coords.yR,coords.randomType,coords.density)
      }
      else if (objectRule.type == "randomAreasAtRandom"){
        const coords = objectRule.coordinates;
        generateObjectRandomAreasAtRandom(obj,objectRule.math,coords.xS,coords.yS,coords.xR,coords.yR,coords.randomType,coords.density)
      };
    });
  });
};

function updateWorld() {
  world.at(player.chunkCoordinatesYold).at(player.chunkCoordinatesXold).at(player.coordinatesYold%chunkSize).splice(player.coordinatesXold%chunkSize,1,player.Avatar.tileOnOld);
  world.at(player.chunkCoordinatesY).at(player.chunkCoordinatesX).at(player.coordinatesY%chunkSize).splice(player.coordinatesX%chunkSize,1,player.Avatar);
};

function getGrid(x,y) {
  let chunkX = Math.floor(x/chunkSize);
  let chunkY = Math.floor(y/chunkSize);
  if (x >= 0 && x < worldSizeX && y >= 0 && y < worldSizeY) {
    return world.at(chunkY).at(chunkX).at(y%chunkSize).at(x%chunkSize);
  }
  return null;
};

function drawMapNew() {
  //ctx.clearRect(0,0,canvas.width,canvas.height);
  let images = [];
  row = [];
  let rSChunkY = 0;
  let rSChunkX = 0;
  let rowY = 0;
  if (player.chunkCoordinatesY <= 0) {rSChunkY= 0;}
  else if (player.chunkCoordinatesY >= 3*worldScale-1) {rSChunkY = -2;}
  else {rSChunkY = -1;};
  if (player.chunkCoordinatesX <= 0) {rSChunkX= 0;}
  else if (player.chunkCoordinatesX >= 3*worldScale-1) {rSChunkX = -2;}
  else {rSChunkX = -1;};
  for (let rChunkY = rSChunkY;rChunkY < 3+rSChunkY;rChunkY++) {
    for (let y = 0;y < 3;y++) {
      for (let rChunkX = rSChunkX;rChunkX < 3+rSChunkX;rChunkX++) {
        for (let x = 0;x < 3;x++) {
          const tile = world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x);
          row.push(tile.tileImageName);
        };
        fetch("/Tiles/files.json")
        .then(files => files.json())
        .then(filesjson => {
          filesjson.files.forEach(imgname => {
            if (!imgname.includes(".json") && images.filter(img => img.name == imgname).length == 0) {
              let image = new Image();
              image.src = "/Tiles/"+imgname;
              image.name = imgname;
              images.push(image);
            };
          });
        })
        .then(() => {
          row.forEach((tile,index) => {
            let image = new Image();
            image.src = images.find(img => img.name == tile).src;
            image.onload = () => {
              ctx.drawImage(image,index*49,rowY*49,49,49)
            };
          });
        });
        rowY +=1;
      };
    };
  };
};

function drawMap() {
  //ctx.fillStyle = "red";
  //ctx.fillRect(30,30,60,60);
  console.clear();
  row = "";
  if (player.chunkCoordinatesY > 0 && player.chunkCoordinatesY < 3*worldScale-1) {
    for (let rChunkY = -2;rChunkY < 3;rChunkY++) {
      for (let y = 0;y < 3;y++) {
        if (player.chunkCoordinatesX > 0 && player.chunkCoordinatesX < 3*worldScale-1) {
          for (let rChunkX = -2;rChunkX < 3;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
      
        else if (player.chunkCoordinatesX == 0) {
          for (let rChunkX = 0;rChunkX < 5;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
        else if (player.chunkCoordinatesX == 3*worldScale-1) {
          for (let rChunkX = -4;rChunkX < 1;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        };
        console.log(row);
        row = ""
      };
    };
  }
  else if (player.chunkCoordinatesY == 0) {
    for (let rChunkY = 0;rChunkY < 5;rChunkY++) {
      for (let y = 0;y < 3;y++) {
        if (player.chunkCoordinatesX > 0 && player.chunkCoordinatesX < 3*worldScale-1) {
          for (let rChunkX = -2;rChunkX < 3;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
      
        else if (player.chunkCoordinatesX == 0) {
          for (let rChunkX = 0;rChunkX < 5;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
        else if (player.chunkCoordinatesX == 3*worldScale-1) {
          for (let rChunkX = -4;rChunkX < 1;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        };
        console.log(row);
        row = ""
      };
    };
  }
  else if (player.chunkCoordinatesY == 3*worldScale-1) {
    for (let rChunkY = -4;rChunkY < 1;rChunkY++) {
      for (let y = 0;y < 3;y++) {
        if (player.chunkCoordinatesX > 0 && player.chunkCoordinatesX < 3*worldScale-1) {
          for (let rChunkX = -2;rChunkX < 3;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
      
        else if (player.chunkCoordinatesX == 0) {
          for (let rChunkX = 0;rChunkX < 5;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        }
        else if (player.chunkCoordinatesX == 3*worldScale-1) {
          for (let rChunkX = -4;rChunkX < 1;rChunkX++) {
            for (let x =0;x < 3;x++) {
              row = row+world.at(player.chunkCoordinatesY+rChunkY).at(player.chunkCoordinatesX+rChunkX).at(y).at(x).tile
            };
          };
        };
        console.log(row);
        row = ""
      };
    };
  };
  for (let i = 1;i <= player.inventory.length;i++) {
    const slot = player.inventory.find(slot => slot.slotId == i);
    row =i + ".";
    if (player.selectedSlot.slotId == i){
      row = row + ">"
    }
    else {
      row = row + " "
    };
    row = row + slot.item.name;
    if (slot.item.name != "empty") {
      row = row + " ×" + slot.itemCount
    }
    console.log(row)
  };
  if (player.debug) {
    console.log("X:"+player.coordinatesX+"\nY:"+player.coordinatesY+"\nChunkX:"+player.chunkCoordinatesX+"\nChunkY:"+player.chunkCoordinatesY+"\nXold:"+player.coordinatesXold+"\nYold:"+player.coordinatesYold+"\nSelectedSlot:"+player.selectedSlot.itemCount+"\nInventory:"+player.inventory)
  };
};

function setPlayerCoordinatesOld() {
  player.coordinatesYold = player.coordinatesY;
  player.coordinatesXold = player.coordinatesX;
};

function setPlayerTileOn(x,y) {
  if (player.Avatar.tileOn == "") {
    player.Avatar.tileOn = { ...getGrid(player.coordinatesX,player.coordinatesY) };
    player.Avatar.tileOnOld = { ...getGrid(0,0) };
  }
  else {
    player.Avatar.tileOnOld = { ...player.Avatar }.tileOn;
    player.Avatar.tileOn = getGrid(x,y);
  };
};

function movePlayer(x,y) {
  if (getGrid(player.coordinatesX+x,player.coordinatesY+y)?.isWalkable) {
    player.chunkCoordinatesYold = player.chunkCoordinatesY;
    player.chunkCoordinatesXold = player.chunkCoordinatesX;
    setPlayerCoordinatesOld();
    player.coordinatesX += x;
    player.coordinatesY += y;
    player.chunkCoordinatesX = (player.coordinatesX-(player.coordinatesX%chunkSize))/chunkSize;
    player.chunkCoordinatesY = (player.coordinatesY-(player.coordinatesY%chunkSize))/chunkSize;
    setPlayerTileOn(player.coordinatesX,player.coordinatesY)
  };
};

function interact(worldUpdate,Player) {
  let direction = prompt("Please select which way to interact:");
  const slot = Player.selectedSlot;
  if (slot?.item?.trigger == null ) {
    switch (direction) {
      case "w":
      case "+":
        if (Player.coordinatesX >= 0 && Player.coordinatesX < worldSizeX && Player.coordinatesY-1 >= 0 && Player.coordinatesY-1 < worldSizeX) {
          const object = getGrid(Player.coordinatesX,Player.coordinatesY-1);
          const trigger = functions.find(func => func.name == object.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX,Player.coordinatesY-1,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "s":
      case "-":
        if (Player.coordinatesX >= 0 && Player.coordinatesX < worldSizeX && Player.coordinatesY+1 >= 0 && Player.coordinatesY+1 < worldSizeX) {
          const object = getGrid(Player.coordinatesX,Player.coordinatesY+1);
          const trigger = functions.find(func => func.name == object.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX,Player.coordinatesY+1,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "a":
      case "<":
        if (Player.coordinatesX-1 >= 0 && Player.coordinatesX-1 < worldSizeX && Player.coordinatesY >= 0 && Player.coordinatesY < worldSizeX) {
          const object = getGrid(Player.coordinatesX-1,Player.coordinatesY);
          const trigger = functions.find(func => func.name == object.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX-1,Player.coordinatesY,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "d":
      case ">":
        if (Player.coordinatesX+1 >= 0 && Player.coordinatesX+1 < worldSizeX && Player.coordinatesY >= 0 && Player.coordinatesY < worldSizeX) {
          const object = getGrid(Player.coordinatesX+1,Player.coordinatesY);
          const trigger = functions.find(func => func.name == object.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX+1,Player.coordinatesY,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    };
  }
  else {
    switch (direction) {
      case "w":
      case "+":
        if (Player.coordinatesX >= 0 && Player.coordinatesX < worldSizeX && Player.coordinatesY-1 >= 0 && Player.coordinatesY-1 < worldSizeY) {
          const item = slot.item;
          const trigger = functions.find(func => func.name == item.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX,Player.coordinatesY-1,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "s":
      case "-":
        if (Player.coordinatesX >= 0 && Player.coordinatesX < worldSizeX && Player.coordinatesY+1 >= 0 && Player.coordinatesY+1 < worldSizeY) {
          const item = slot.item;
          const trigger = functions.find(func => func.name == item.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX,Player.coordinatesY+1,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "a":
      case "<":
        if (Player.coordinatesX-1 >= 0 && Player.coordinatesX-1 < worldSizeX && Player.coordinatesY >= 0 && Player.coordinatesY < worldSizeY) {
          const item = slot.item;
          const trigger = functions.find(func => func.name == item.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX-1,Player.coordinatesY,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    
      case "d":
      case ">":
        if (Player.coordinatesX+1 >= 0 && Player.coordinatesX+1 < worldSizeX && Player.coordinatesY >= 0 && Player.coordinatesY < worldSizeY) {
          const item = slot.item;
          const trigger = functions.find(func => func.name == item.trigger);
          return trigger.func(worldUpdate,Player.coordinatesX+1,Player.coordinatesY,Player)
        }
        else {
          return {world:worldUpdate,player:Player}
        };
        break;
    };
  }
};

function profile() {
  console.log("Name:"+player.Name+"\nClass:"+player.Class()+"\nXP:"+player.Xp)
};

createWorld();

let action = "";

setPlayerTileOn(player.coordinatesX,player.coordinatesY);

updateWorld();

drawMap();

while (true) {
  action = prompt("What To Do:");
  if (action == "+" || action == "w") {
    
    movePlayer(0,-1);
  }
  else if (action == "-" || action == "s") {
    
    movePlayer(0,1);
  }
  else if (action == "<" || action == "a") {
    
      movePlayer(-1,0);
  }
  else if (action == ">" || action == "d") {
    
      movePlayer(1,0);
  }
  else if (action == "debug") {
    switch (player.debug){
      case true:
        player.debug=false;
        break;
      case false:
        player.debug=true
    }
  }
  updateWorld();
  drawMap();
  setPlayerCoordinatesOld();
  if (action == "exit") {
    break
  }
  else if (action == "1") {
    if (player.selectedSlot === player.inventory.find(obj => obj.slotId == action)) {
      console.log("slot was 1")
    }
    else {
      player.selectedSlot = player.inventory.find(obj => obj.slotId == action);
    }
    drawMap();
  }
  else if (action == "2") {
    if (player.selectedSlot === player.inventory.find(obj => obj.slotId == action)) {
      console.log("slot was 2")
    }
    else {
      player.selectedSlot = player.inventory.find(obj => obj.slotId == action);
    }
    drawMap();
  }
  else if (action == "3") {
    if (player.selectedSlot === player.inventory.find(obj => obj.slotId == action)) {
      console.log("slot was 3")
    }
    else {
      player.selectedSlot = player.inventory.find(obj => obj.slotId == action);
    }
    drawMap();
  }
  else if (action == "4") {
    if (player.selectedSlot === player.inventory.find(obj => obj.slotId == action)) {
      console.log("slot was 4")
    }
    else {
      player.selectedSlot = player.inventory.find(obj => obj.slotId == action);
    }
    drawMap();
  }
  else if (action == "5") {
    if (player.selectedSlot === player.inventory.find(obj => obj.slotId == action)) {
      console.log("slot was 5")
    }
    else {
      player.selectedSlot = player.inventory.find(obj => obj.slotId == action);
    }
    drawMap();
  }
  else if (action == "0") {
    player.selectedSlot = {};
    drawMap();
  }
  else if (action == "profile"){
    profile();
  }
  else if (action == "e") {
    let interaction = interact(world,player);
    world = interaction.world;
    player = interaction.player
    drawMap();
  }
}