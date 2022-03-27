/* eslint-disable @typescript-eslint/no-explicit-any */


/////// Start US News Types ///////
export interface Institution {
  footnote?: any;
  isPublic: boolean;
  primaryKey: string;
  schoolType: string;
  ranking: string;
  rankingType: string;
  displayName: string;
  sortName: string;
  urlName: string;
  aliasNames: string;
  state: string;
  city: string;
  zip: string;
  region: string;
  xwalkId: string;
  metroId: string;
  institutionalControl: string;
  rankingDisplayName: string;
  rankingDisplayRank: string;
  rankingDisplayScore: string;
  rankingMaxPossibleScore?: any;
  rankingSortRank: number;
  rankingNoteText?: any;
  rankingNoteCharacter?: any;
  rankingRankStatus: string;
  rankingIsTied: boolean;
  isPrimary: boolean;
  linkedDisplayName: string;
  location: string;
  rankingFullDisplayText: string;
  heroImage: boolean;
  primaryPhotoCardSmall: string;
  primaryPhotoMedium: string;
  primaryPhotoCardLarge: string;
  primaryPhotoThumb: string;
  photoCount: number;
}

export interface Overall {
  displayName: string;
}

export interface Parent {
  displayName: string;
  displayRank: string;
  displayScore: string;
  maxPossibleScore?: any;
  sortRank: number;
  noteText?: any;
  noteCharacter?: any;
  rankStatus: string;
  isTied: boolean;
}

export interface ParentRank {
  displayValue?: any;
  rawValue?: any;
  fieldName: string;
}

export interface Tuition {
  subText?: any;
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldType: string;
  anchorPage?: any;
  displayValue: string;
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
  fieldName: string;
}

export interface DisplayValue {
  value: string;
  name: string;
}

export interface Enrollment {
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldName: string;
  fieldType?: any;
  anchorPage?: any;
  displayValue: DisplayValue[];
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
}

export interface CostAfterAid {
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldName: string;
  fieldType?: any;
  anchorPage?: any;
  displayValue: string;
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
}

export interface PercentReceivingAid {
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldName: string;
  fieldType?: any;
  anchorPage?: any;
  displayValue: string;
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
}

export interface AcceptanceRate {
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldName: string;
  fieldType?: any;
  anchorPage?: any;
  displayValue: string;
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
}

export interface HsGpaAvg {
  dataQaId: string;
  noteText?: any;
  rawValue: number;
  fieldName: string;
  fieldType?: any;
  anchorPage?: any;
  displayValue: string;
  noteCharacter?: any;
  anchorLocation?: any;
  correctionTooltip?: any;
}

export interface SatAvg {
  dataQaId: string;
  noteText: string;
  rawValue: number;
  fieldName: string;
  displayValue: string;
  noteCharacter: string;
  correctionTooltip?: any;
}

export interface ActAvg {
  dataQaId: string;
  noteText: string;
  rawValue: number;
  fieldName: string;
  displayValue: string;
  noteCharacter: string;
  correctionTooltip?: any;
}

export interface EngineeringRepScore {
  dataQaId: string;
  noteText?: any;
  rawValue: string;
  fieldName: string;
  fieldType?: any;
  displayValue: string;
  noteCharacter?: any;
  correctionTooltip?: any;
}

export interface BusinessRepScore {
  dataQaId: string;
  noteText?: any;
  rawValue: string;
  fieldName: string;
  fieldType?: any;
  displayValue: string;
  noteCharacter?: any;
  correctionTooltip?: any;
}

export interface ComputerScienceRepScore {
  dataQaId: string;
  noteText?: any;
  rawValue: string;
  fieldName: string;
  fieldType?: any;
  displayValue: string;
  noteCharacter?: any;
  correctionTooltip?: any;
}

export interface NursingRepScore {
  dataQaId: string;
  noteText?: any;
  rawValue: string;
  fieldName: string;
  fieldType?: any;
  displayValue: string;
  noteCharacter?: any;
  correctionTooltip?: any;
}

export interface DisplayValue2 {
  value: string;
  name: string;
}

export interface TestAvgs {
  displayValue: DisplayValue2[];
}

export interface SearchData {
  parentRank: ParentRank;
  tuition: Tuition;
  enrollment: Enrollment;
  costAfterAid: CostAfterAid;
  percentReceivingAid: PercentReceivingAid;
  acceptanceRate: AcceptanceRate;
  hsGpaAvg: HsGpaAvg;
  satAvg: SatAvg;
  actAvg: ActAvg;
  engineeringRepScore: EngineeringRepScore;
  businessRepScore: BusinessRepScore;
  computerScienceRepScore: ComputerScienceRepScore;
  nursingRepScore: NursingRepScore;
  testAvgs: TestAvgs;
}

export interface Ranking {
  ranking: string;
  type: string;
  displayName: string;
  displayRank: string;
  displayScore: string;
  maxPossibleScore?: any;
  sortRank: number;
  noteText?: any;
  noteCharacter?: any;
  rankStatus: string;
  isTied: boolean;
}

export interface Extras
{
  urlUSNews: string; // URL of school on US news Wesbite
  urlSchool: string; // URL of the school's website
}

export interface USNewsInstitution {
  primaryKey: string[];
  institution: Institution;
  overall: Overall;
  parent: Parent;
  searchData: SearchData;
  xwalkId: string;
  blurb: string;
  ranking: Ranking;
  additional?: Extras;
}

/////// End US News Types ///////


export interface TESchool {
  name: string;
  state_full: string;
  state_short: string;
  urlTE: string;
  urlSchoolTE: string;
}

export interface SimplifiedInstitution {
  displayName: string; // institution key
  state: string; // institution key
  city: string; // institution key
  foundTE: boolean;
  foundUSNews: boolean;
  primaryKey: string; // root level
  urlName: string; // institution level
  isPublic: boolean; // institution key, true
  aliasNames:string; // institution key, "CUNY Hunter College CUNY Hunter College"
  schoolType: string; // institution key, "regional-universities-north"
  sortName: string; // institution key, cunyhuntercollege
  rankingType: string; // institution key, "regional-universities-north"
  rankingDisplayName: string; // institution key, "Regional Universities North"
  rankingDisplayRank: string; // institution key, "#18" or "#120-#125" or unranked
  rankingSortRank: number; // institution key, 18 or -1 or -2
  rankingFullDisplayText: string; // institution key, #18 in Regional Universities North
  zip: string; // institution key
  region: string; // institution key
  tuition: number; // searchData.tuition.rawValue key
  enrollment: number; // searchData.enrollment.rawValue key
  acceptanceRate: number // searchData.acceptanceRate.rawValue
  hsGpaAvg: number // searchData.hsGpaAvg.rawValue
  urlSchoolUSNews: string; // searchData.urlUSNews key
  urlUSNews: string;
  urlSchoolTE: string;
  urlTE: string;
  nameTE: string; // blank
  stateTE: string; // blank
  suspicious: boolean; // false
}
