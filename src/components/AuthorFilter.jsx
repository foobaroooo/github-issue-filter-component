import { useEffect, useState } from "react";
import octokit from "../api/github-api";
import GithubFilter from "./GithubFilter";

const AuthorFilter = ({ children }) => {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response= await octokit.request(
          "GET /repos/{owner}/{repo}/contributors",
          {
            owner: "facebook",
            repo: "react",
          }
        );
  
        //console.log(response.data);

        setAuthors(response.data);
      } catch (error) {
        console.error(error);
      } 
    };
    fetchAuthors();
  }, []);

  const filterFunc = (item, inputValue) => {
    return item.login.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  const renderAuthor = (item) => {
    return (
      <div className="flex items-center gap-2">
        <img src={item.avatar_url} alt={`${item.login}'s avatar`} className="w-4 h-4 rounded-lg border border-gray-300" />
        {item.login}
      </div>
    );
  };
  // todo - render authors
  return <GithubFilter 
            data={authors} 
            placeHolder="Filter authors" 
            children={children} 
            renderItem={renderAuthor}
            filterFunc={filterFunc}
          />;
};
export default AuthorFilter;


