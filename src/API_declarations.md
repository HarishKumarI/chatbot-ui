
# **API Definitions**

- **POST** for session initialization  
  response will include:
    1) status message
    2) nudges list or empty list   
    3) messsages ( can be welcome messages or any formatted replies )
    4) images ( if any, can be used to display along with message or thumbnail carousel )
    5) confirm messages ( will be useful while asking user to confirm the details. 
          will be good if we can get the texts of the buttons because for different 
          usecase we can use different texts. ) 
    6) form_feilds => in below format along with title of the form
        ```
          {
            "name of field" : {
              type : 'text' | 'radio' | 'date' | 'dropdown'
              value: '' | []  // string for text, date and list for dropdown and radio and other
              placeholder: '' ( optional )
            }
          }
        ```
    1) trigger_review - trigger to activate the review mode of the chatbot.
  
  ```
    POST => /api/session/${session_id}

    payload = {}

    response 
      {
          msg: 'Success',
          replies: [],
          nudges: [],
          images: [''],
          confirm_btn_text: [ 'Correct', 'In-Correct'],
          trigger_review: true
      }
  ```

- **POST** post user input
  ```
    POST => /api/query
    payload = { user_input: '' }
    response => same as above
  ```

- **POST** post user review
  ```
    POST => /api/review/

    payload 
      {
        feedback: true | false,
        feedback_msg: ''
      }
    
    response => {
      msg: 'Success',
      feedback_reply: ''
    }
  ```
