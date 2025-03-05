# Backend for student site

**run locally**: `netlify dev`

**deployment**: https://app.netlify.com/sites/chnu-student-interview-preparation/deploys/

GET  https://your-site.netlify.app/.netlify/functions/getQuestion?id=someID \
GET  https://your-site.netlify.app/.netlify/functions/listQuestions?search=example \
POST https://your-site.netlify.app/.netlify/functions/createQuestion \
PUT  https://your-site.netlify.app/.netlify/functions/updateQuestion?id=someID \
DELETE https://your-site.netlify.app/.netlify/functions/deleteQuestion?id=someID \


**data format**:

```
{
	"text": "test",
	"answers": ["a", "b", "c", "d"],
	"numberCorrect": 1,
	"topic": "test-topic"
}
```

**to do**

1. ~~jwt auth~~
2. ~~skip take~~
3. graphQl query
4. graphQl mutation
5. web sockets
6. logging 
7. unit tests
8. 

