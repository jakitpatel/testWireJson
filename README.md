Install Node Js : https://nodejs.org/en/download/

Run this app using following command

### node app.js 

For Getting & pushing the code to Source Control GitHub Repository

For cloning any existing repository from remote

### git clone git@github.com:User/UserRepo.git

Below is used to a add a new remote to existing repository if there is no remote link exist : https://git-scm.com/docs/git-remote

### git remote add origin git@github.com:User/UserRepo.git

Below is used to change the url of an existing remote repository: https://git-scm.com/docs/git-remote

### git remote set-url origin git@github.com:User/UserRepo.git

Below will push your code to the master branch of the remote repository defined with origin and -u let you point your current local branch to the remote master branch:

### git add --all
### git commit -m "Any message related to changes done in files"
### git push -u origin master