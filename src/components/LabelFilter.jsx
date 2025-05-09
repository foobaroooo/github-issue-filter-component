import { useEffect, useState } from "react";
import octokit from "../api/github-api";
import GithubFilter from "./GithubFilter";

const LabelFilter = ({ children }) => {
  const [labels, setLabels] = useState([]);
  useEffect(() => {
    const fetchLabels = async () => {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/labels",
        {
          owner: "facebook",
          repo: "react",
        }
      );
      setLabels(data);
    };
    fetchLabels();
  }, []);

  // todo - render labels
  return <GithubFilter placeHolder="Filter labels" children={children} />;
};

export default LabelFilter;
