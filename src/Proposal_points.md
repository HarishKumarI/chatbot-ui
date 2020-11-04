### **capabilities**

- [x] welcome message
- based on user message decide
  - [x] comparison or Specs & Features 
  - [x] understand different cars ( variants included )
  - [x] comparison of specs
  - [ ] **UI toggle** to show only difference or similaties  
  - [x] different specs of a car
  - [x] Summary
  - [x] filters in question ( can be done with forms )
  - [x] **comparison**
    - comparison between two cars. ( will be table or cards carousel based on the look in UI )
    - brief comparison 
    - detail comparison ( redirect to carwale site ).
  - [x] User prompts ( by using form to get more information from the user )
  - [x] different types of response 
    - plain text
    - Markdown text
    - text with images ( cards )
    - Hyperlinking 
  


when detail comparison is how to point to detail comparison.
how to highlight the details given by the user.


Questions:
- showing differences of two or more cars
- brief comparison






/create-session
```
payload
{ 
    context: 'none',
    timestamp: '',
    channel: 'cognichat',
    brower_info: ''
}
```

**form :**
- text,
- dropdown,
- radio,
- checkbox,
- slider  - later stage.
- datepicker

form title
form description
feild description

if single feild form then form title and form descr to null

persona image and text to be placed on the bot message. - done

table and image corousel decide based on the output

work on showing the form response to user on submit.



pointers from form handling demo
- In general : Many Chatbots send multiple message fragments in response to one user query. We should allow the same. 
- Working memory mapping using instance of concept, and compute method variables
Config od compute node - which UI and in what way?
- Declrative way for 'Form - desc, field title, field placeholder, field type, validation required' etc. 
- In form mode - out of context question : How ill it work?
- What module in the design will handle - Getting into task mode and getting out of task mode. 
- Task mode flexibility : Validate against the FrameBot paper, Rasa form design, external method integration aspects that we know about - univ calendar, IR retrieval for Quaratine, Price calculator, Car suggester task, dealer lead task.


assets of cars while listing
