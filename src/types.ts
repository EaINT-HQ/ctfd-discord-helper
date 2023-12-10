export type CtfdResponseChallenges =
    | {
          success: true;
          data: {
              id: number;
              type: string;
              name: string;
              value: number;
              solves: number;
              solved_by_me: boolean;
              category: string;
              tags: string[];
              template: string;
              script: string;
          }[];
      }
    | {
          success: false;
      };

export type CtfdResponseChallengeDetailData = {
    description: string;
    connection_info?: string | null;
    files: unknown[];
};

export type CtfdResponseChallengeDetail =
    | {
          success: true;
          data: CtfdResponseChallengeDetailData;
      }
    | {
          success: false;
      };
