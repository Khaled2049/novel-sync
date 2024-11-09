export interface IClub {
  id: string;
  name: string;
  description: string;
  image: string;
  members: string[];
  category: string;
  activity: string;
  creatorId: string;
  bookOfTheMonth?: IBookOfTheMonth;
  discussions?: IDiscussion[];
  meetUp?: string;
}

export interface IDiscussion {
  id: string;
  title: string;
  content: string;
  creatorId: string;
  comments: IComment[];
  date: string;
}

export interface IComment {
  id: string;
  content: string;
  creatorId: string;
}

export interface IBookOfTheMonth {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export interface IBookClub {
  club: IClub;
}
