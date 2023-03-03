declare interface User {
    _id: string
    name: string
    email: string
    password: string
    online: boolean
    notification: [{
        msg: string
        senderId: string
        time: string
        _id: string
    }]
}

declare interface Message {
    userId: string;
    message: string; 
    time: string;
    image?: string;
}