// jshint eversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://arpit_admin:Test1234@cluster0.cyd1n.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const ItemsSchema = new mongoose.Schema({
    name : String
}); 

const Item = mongoose.model("Item",ItemsSchema);
     
const item1 = new Item({
    name: "Welcome to your todolist!",
});

const item2 = new Item({
    name: "Hit the + button to add new item",
});

const item3 = new Item({
    name: "<-- Hit this to delete an item",
});

const defaultItems = [item1,item2,item3];

const ListSchema = {
    name: String,
    items: [ItemsSchema]
};

const List = mongoose.model("List",ListSchema);

app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully Inserted.");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", {ListTitle: "Today",newListItems: foundItems});
        }
    });

     
});

app.get("/:customListName",function(req,res){
   
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){

        if(!err){
            if(!foundList){
                // Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //Show an existing list
                res.render("List",{ListTitle: foundList.name,newListItems: foundList.items});
            }
        }

    });
    

});


app.post("/",function(req,res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        
        item.save();

        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }


});

app.post("/delete",function(req,res){

    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName == "Today"){
        Item.findByIdAndRemove(checkItemId,function(err){
            if(!err){
                console.log("Succesfully Removed!");
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
    

});



// app.get("/work",function(req,res){
//     res.render("list", {ListTitle: "Work List",newListItems: workItem}); 
// });


// app.post("/work",function(req,res){
//     let item = req.body.newItem;
//     workItem.push(item);
//     res.redirect("/work");
// });


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server has started successfully 3000.");
})

    