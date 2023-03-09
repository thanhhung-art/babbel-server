declare interface User {
    
    name: string;
    email: string;
    password?: string;
    ggId?: string;
    avatar?: string;
    friends: string[];
    friendreq: string[];
    roomJoined: string[];
    loginWithGG?: boolean | undefined;
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