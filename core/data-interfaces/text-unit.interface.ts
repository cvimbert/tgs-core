import { TagModel, BlockLineType } from "tgs-model";

export interface TextUnit {
  blockId?: string;
  text?: string;
  units?: TextUnit[];
  styles?: string[];
  tag?: TagModel;
  textType?: BlockLineType;
}
