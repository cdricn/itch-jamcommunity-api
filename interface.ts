
export interface Entries {
  title: string,
  url: string,
  members: number,
  deadline: string,
  host: string
}

export interface JamInfo {
  title: string,
  url: string,
  members: number,
  deadline: string,
  host: string
}

export interface Posts {
  title: string,
  url: string,
  content: string,
  replies: number,
  datePosted: string,
  author: string,
  tags: TagType
}

export interface TagType {
  [tag:string] : string;
}
