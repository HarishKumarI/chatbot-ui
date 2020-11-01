# Chatbot UI 

- ask user who he/she is
- adding suggestion questions ( tap to answer buttons )
- In some use-cases, it takes certain amount to time to process the user’s request. In such cases, add fillers to keep the user engaged. Don’t keep the user waiting!

### Useful References
- https://www.chatbot.com/
- https://insent.ai/
- https://www.drift.com/
- https://manychat.com/
- https://mobilemonkey.com/blog/popular-chatbots


### Must features
- [x] show a ... loading indicator while backend is processing ( loading animation )
- [ ] Session Creation
- [ ] Maintenance
- [x] Welcome Message
- [x] Showing Nudges with message
- [x] Collecting Feedback from user T-up/ T-down
- [x] Opening detail feedback option on T-down : **Optionally via a configuration. A message to show for such feedback form**
- Asking a question back to the user with capturing input back as 
  - [x] "Text"
  - [x] "Select from Multiple options"
  - [x] "Date"
  - [x] "Yes/No - confirmation" 
- [x] Ability to show a Hyperlink separately as part of resposne with corresponding text. 
- "Form" content to be shown to the user : **Two modes**
    - [x] HTML where the form can be shown directly
    - [x] "Messenger" mode where the form has to be achieved by a series of question back to the user with response types as above. 
- [x] response with thumbnails and carousel


### UI Customizability : 
- Colour theme for Dialogue boxes
- text colours
- borders
- background image
- chip colours
- text colours of chips
- images used for any actions
- Window title


**Bot persona image - where to show ??**

**ability to retrieve chat history if user doesn't end the session**


1. UI for nudge and node proerties
2. invoke_nudge rel name - related_to / better generalize 



component arrangement in such a way to extend and use in chatbot etc.



#### **comments**
- bottom nudges to be placed along messages as scrollable. - done
- the input text is not going immediately. - done
- for bigger answers, use expand button and then show the while text.
- link's not displaying. 
- use form for getting user feedback.


### components for chatbot

- [x] text
- [x] dots
- [x] msg
- [x] time
- [ ] image
- [x] nudges
- [ ] hyperlinks
- [ ] form fields
- [x] feedback
- [ ] image carousel
- [ ] confirm msgs
- [x] suggested questions


#### Conversational AL Design Discussion
- UI need to clear the chat history when the session terminates.
- use of cookies for session management. ( handling of loged in user and guest user )
- demo 1 : QA, transactions, working mem handling, with UI