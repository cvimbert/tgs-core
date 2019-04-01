import { TagModel, BlockLineType } from "tgs-model";

export interface TextUnit {
  text?: string;
  units?: TextUnit[];
  styles?: string[];
  tag?: TagModel;
  textType?: BlockLineType;
}
