import { useEffect, useState } from "react";
import octokit from "../api/github-api";
import GithubFilter from "./GithubFilter";

const AuthorFilter = ({ children }) => {
  const [authors, setAuthors] = useState([]);
  useEffect(() => {
    const fetchAuthors = async () => {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/contributors",
        {
          owner: "facebook",
          repo: "react",
        }
      );
      setAuthors(data);
    };
    fetchAuthors();
  }, []);

  // todo - render authors
  return <GithubFilter placeHolder="Filter authors" children={children} />;
};
export default AuthorFilter;
