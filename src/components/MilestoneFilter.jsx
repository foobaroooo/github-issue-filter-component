import { useState, useEffect } from "react";
import octokit from "../api/github-api";
import GithubFilter from "./GithubFilter";

const MilestoneFilter = ({ children }) => {
  const [milestones, setMilestones] = useState([]);
  useEffect(() => {
    const fetchMilestones = async () => {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/milestones",
        {
          owner: "facebook",
          repo: "react",
        }
      );
      setMilestones(data);
    };
    fetchMilestones();
  }, []);

  // todo - render milestones
  return <GithubFilter placeHolder="Filter milestones" children={children} />;
};

export default MilestoneFilter;
