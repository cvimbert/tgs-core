import { TagModel } from "tgs-model";

export interface TextUnit {
  text?: string;
  units?: TextUnit[];
  styles?: string[];
  tag?: TagModel;
}
