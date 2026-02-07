export interface LetterContent {
  background: string;
  textElements: {
    id: string;
    text: string;
    x: number;
    y: number;
    font: string;
    color: string;
    fontSize: number;
    width?: number;
    height?: number;
    rotation: number;
    scale: number;
  }[];
  images: {
    id: string;
    url: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }[];
  stickers: {
    id: string;
    stickerId: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }[];
}

export interface Letter {
  senderName: string;
  recipientName: string;
  content: LetterContent;
  status: "draft" | "sent";
}
