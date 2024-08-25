
export interface usersProfile{
    name:string;
    email_address:string;
    username:string;
    Bio:string;
    image_url:string;
    website:string;
    location:string;
    occupation:string;
    dob:string;
    created_on:Number;
    background_image_url:string;
    no_of_followers:Number;
    followers_list:[];
    following_list:[];
    post_list:[];
    reply_list:[];
    like_list:[];
}
export interface Posts{
    _id:any;
    author_address:string;
    author_username:string;
    content_url:string;
    post_type:string;
    time:Number;
    media_url:string;
    on_chain:Boolean;
    parent_post:string;
    view:[];
    repost_list:[];
    reply_list:[];
    like_list:[];
    tags:[];
    visibility:boolean;

}

export interface Users{
    _id:string;
    wallet_address:string;
    sign_up_hash:string;
    profile:{};
}
export interface metaData{
    post_id:string;
    post_type:string;
    author_address:string;
    author_username:string;
    time:string;
    media:string;
    content:string;
    app:string;
}

export interface repost{
    _id:any;
    post_id:string;
    time:Number;
    repost_username:string;
}