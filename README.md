# Q&A REST API

### GET / Get all Q&A(s)
**response**
  question:Array
************
### post /ask ask new question 
**request body parameters**
  questionHeader:String 
  [Optional]questionDescription:String 
**response**
  message:String
  question:Object
************
### /question/{questionID}
  - GET get specific question 
    - **request path parameters**
      - questionID:String 
    - **response**
      - question:Object
  - POST Add answer of specific question 
    - **request path parameters**
      - questionID:String
    - **request body parameters**
      - answer:String 
    - **response**
      - message:String
  - PATCH update question 
    - **request path parameters**
      - questionID:String
    - **request body parameters**
      - questionHeader:String 
      - questionDecription:String
    - **response**
      - message:String
  - DELETE delete question 
    - **request path parameters**
      - questionID:String
    - **response**
      - message:String 
      - question:Object
**************
### /question/{questionID}/answer/{answerID}
  - PATCH update answer 
    - **request path parameters**
      - questionID:String
      - answerID:String
    - **request body parameters**
      - newAnswer:String
    - **response**
      - message:String
  - DELETE delete answer 
    - **request path parameters**
      - questionID:String 
      - answerID:String 
    - **response**
      - message:String
**************
### /question/{questionID}/upvote
  - GET get number of upvoters
    - **request path parameters**
      - questionID:String 
    - **response**
      - message:Object
  - PUT update number of upvoters 
    - **request path parameters**
      - questionID:String
    - **request body parameters**
      - currentValue:String
      - addToCurrentVote:String
    - **response**
      - message:String
**************
### /question/{questionID}/downvote
  - GET get number of downvoters
    - **request path parameters**
      - questionID:String 
    - **response**
      - message:Object
  - PUT update number of downvoters 
    - **request path parameters**
      - questionID:String
    - **request body parameters**
      - currentValue:String
      - addToCurrentVote:String
    - **response**
      - message:String
      
