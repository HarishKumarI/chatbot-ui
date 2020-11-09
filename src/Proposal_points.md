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



ways to embed custom widgets:
- html string with inline styling.
- iframes ( bad-idea )
- in case of forms for submit provide a action url to access form elements values onsubmit.



#### **things involved to display widgets in UI:**
- HTML code ( icons, images, forms etc )
- styling and user interactions, feedback
- JavaScript events

#### **backend support**
- sending the HTML DOM elements in a String and then using ***dangerouslySetInnerHTML*** which I am already using for displaying markdown content.
- inline styling can be used but it has to be added for each and every element else if any styling is available for that element from the UI side that will be applicable.
- JavaScript code should be added to appropriate events.

#### **Drawbacks**
- these elements won't be able to interact with state objects to React.
- for any form submit, it should be handled by giving an action URL and handled all kinds of data there.
- interactions & feedbacks( hover, etc ) cannot be achieved( since we can only write styling for tags and not interactions in inline styling ). 
- not data exchange with the front-end variable.
- event trigger for each element in the content for example: 
                  in the case of the form if we want to fire separate events for each element then we have to send all these elements separate widgets.

The above drawbacks can be resolved by using iframes except sharing data with the front-end.


table title, desc, table data with row and column headers.



- screenshots of the UI with minimal messages - EOD