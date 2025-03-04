function giveTakeItem(Player,Item,Change) {
  let success = false;
  if (Change > 0) {
    let slots = Player.inventory.filter(slot => slot.item == Item);
    let emptySpace = Player.inventory.filter(slot => slot.item.name == "empty").length*Item.maxCount;
    slots.forEach(slot => emptySpace += (slot.item.maxCount-slot.itemCount));
    if (emptySpace >= Change) {
      success = true;
      for (let i = 0;i < Change;i++) {
        if (slots.find(slot => slot.itemCount+1 <= slot.item.maxCount) != undefined) {
          slots.find(slot => slot.itemCount+1 <= slot.item.maxCount).itemCount += 1
        }
        else {
          let slot = Player.inventory.find(slot => slot.item.name == "empty")
          slot.itemCount += Change-i;
          slot.item = Item;
          break;
        };
      };
    }
    else {success = false;};
  }
  else if (Change < 0) {
    if (Player.selectedSlot.itemCount+Change >= 0){
      success = true;
      for (let i = 0;i > Change;i--){
        Player.selectedSlot.itemCount -= 1;
        if (Player.selectedSlot.itemCount == 0) {
          Player.inventory.at(Player.selectedSlot.slotId-1).item = items.at(0);
        }
        else {};
      };
    }
    else {success = false};
  };
  return {status:success,player:Player}
};
const fs = require('fs');
const path = require('path')
const objectsDir = path.join(__dirname,"Objects");
const itemsDir = path.join(__dirname,"Items");
let chunkSize = 3
let objects = [];
let items = [];
let functions = [
  {
    name:"dropLoot",
    func:(worldUpdate,x,y,Player) => {
      let chunkY = Math.floor(y/chunkSize);
      let chunkX = Math.floor(x/chunkSize);
      let loot = worldUpdate.at(chunkY).at(chunkX).at(y%chunkSize).at(x%chunkSize).loot
      const itemGiveTake = giveTakeItem(Player,items.find(item => item.name == loot.item),loot.count);
      if (itemGiveTake.status) {
        worldUpdate.at(chunkY).at(chunkX).at(y%chunkSize).splice(x%chunkSize,1,{ ...objects.find(obj => obj.id == 0)})
        Player = itemGiveTake.player;
      }
      else {};
      return {world:worldUpdate,player:Player};
    }
  },
  {
    name:"empty",
    func:(worldUpdate,x,y,Player) => {
      return {world:worldUpdate,player:Player};
    }
  },
  {
    name:"placeItem",
    func:(worldUpdate,x,y,Player) => {
      const chunkY = Math.floor(y/chunkSize);
      const chunkX = Math.floor(x/chunkSize);
      let grid = worldUpdate.at(chunkY).at(chunkX).at(y%chunkSize).at(x%chunkSize);
      const selectedItem = Player.selectedSlot.item;
      const tile = objects.find(obj => obj.id == selectedItem.placeBlockId);
      if (grid.isPlaceable) {
        let itemGiveTake = giveTakeItem(Player,items.find(item => item.name == selectedItem.name),-1);
        if (itemGiveTake.status) {
          worldUpdate.at(chunkY).at(chunkX).at(y%chunkSize).splice(x%chunkSize,1,tile)
          worldUpdate.at(chunkY).at(chunkX).at(y%chunkSize).at(x%chunkSize).coordinates = {x:x,y:y};
          Player = itemGiveTake.player;
        }
        else {};
      }
      else {};
      return {world:worldUpdate,player:Player};
    }
  }
  ];
function initializeObjects() {
  const files = fs.readdirSync(objectsDir,'utf8');
  files.forEach(file => {
    const filePath = path.join(objectsDir,file);
    if (path.extname(filePath) == ".json") {
      const data= fs.readFileSync(filePath,'utf8');
      const jsonData = JSON.parse(data);
      objects.push(jsonData)
    }
  });
};
initializeObjects();
function initializeItems() {
  const files = fs.readdirSync(itemsDir,'utf8');
  files.forEach(file => {
    const filePath = path.join(itemsDir,file);
    if (path.extname(filePath) == ".json") {
      const data= fs.readFileSync(filePath,'utf8');
      const jsonData = JSON.parse(data);
      items.push(jsonData)
    }
  });
};
initializeItems();
let emptyInventory = [
  {
    slotId:1,
    item:items.find(Item => Item.name == "empty"),
    itemCount:0
  },
  {
    slotId:2,
    item:items.find(item => item.name == "empty"),
    itemCount:0
  },
  {
    slotId:3,
    item:items.find(item => item.name == "empty"),
    itemCount:0
  },
  {
    slotId:4,
    item:items.find(item => item.name == "empty"),
    itemCount:0
  },
  {
    slotId:5,
    item:items.find(Item => Item.name == "empty"),
    itemCount:0
  }
];
/**window.objects = objects;
window.chunkSize = chunkSize;
window.emptyInventory = emptyInventory;
window.items = items;
window.functions = functions;*/
module.exports=() => {
  return {
    objects,
    chunkSize,
    emptyInventory,
    items,
    functions
  };
};