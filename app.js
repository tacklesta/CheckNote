const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("<ENTER YOUR CONNECTION STRING HERE TO CONNECT TO YOUR DATABASE SERVER>",{useNewUrlParser: true});

const itemsSchema = mongoose.Schema({
  name:{
    type: String,
    require: true
  }
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your TODO List."
})

const item2 = new Item({
  name: "<---- Click first checkbox for deleting a task"
})

const item3 = new Item({
  name: "<---- Click second checkbox for marking a task"
})

const defaultItems =[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},(err,results)=>{

    if(results.length ===0)
    {
      Item.insertMany(defaultItems,(err)=>{
        if(err)
        {
          console.log(err);
        }
        else{
          console.log('Success')
        }
      });
      res.redirect("/");
    }
    else{
      // console.log(results);
      // const day = date.getDate();
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
// const day = date.getDate();
});

app.get('/:customListName',(req,res)=>{
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne({name:customListName},(err,foundList)=>{
    if(foundList)
    {
      console.log("It already exists");
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
    }
    else{
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect('/'+customListName);
    }
  })
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if(listName==="Today")
  {
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+listName);
    })
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete',function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemID,(err)=>{
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Deleted successfully");
        res.redirect('/');
      }
    });
  }
  else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id:checkedItemID}}},
      function(err,foundList){
        if(!err)
        {
          res.redirect('/'+ listName);
        }
      })
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
