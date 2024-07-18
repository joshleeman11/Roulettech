# Deployment to AWS

## Using AWS EC2 to deploy backend Django code

### Create and connect EC2 instance

#### Navigating the AWS console
1. Log in to AWS console


#### Configuring the EC2 instance
1. Head to *EC2* dashboard
2. Head to *Instances* page
3. Click *Launch instances*
4. Add a name
5. Choose an Amazon Machine Image (AMI). I chose a Ubuntu machine, a Ubuntu Server 24.04, and a t2.micro instance type. 
6. Click *Create key pair*, enter a name, and click *Create key pair* again. 
    > The key pair was saved to my Downloads and I moved it into my ssh folder with \
    ```mv ny-josh-macbookair.pem ~/.ssh``` while in my Downloads folder 
7. In *Network settings*, select *Create security group*, *Allow SSH traffic from*, and I only want to be able to log in from my computer so I selected *My IP*. I also checked *Allow HTTPS and HTTP traffic from the internet* so the app can be accessed by anyone from anywhere.
8. Click *Launch instance*

#### Connecting to EC2 instance
1. After launch, click *View all instances* to see all your EC2 instances
2. Wait for *Instance state* to show '*Running*' and *Status check* to show '*2/2 checks passed*' before highlighting the instance and clicking *Connect*
3. Navigate to *SSH Client*
4. From your .ssh directory, run \
```chmod 400 "ny-josh-macbookair.pem"``` to ensure your key is not publicly viewable
5. Next, run \ 
```ssh -i "ny-josh-macbookair.pem" ubuntu@ec2-54-204-179-85.compute-1.amazonaws.com``` to log in to your remote EC2 instance
    > We're using ssh to log in to the remote EC2 instance that's located at the *ec2-54-204-179-85.compute-1.amazonaws.com* IP Address. The default user for the Ubuntu instance is ubuntu. 
6. Once you confirm the connection, run the previous ssh command to log into the instance

#### After logging into EC2 instance
1. Update system of your EC2 instance \
    ```sudo apt-get update```
2. Upgrade system of your EC2 instance \
    ```sudo apt-get upgrade```
3. Install necessary packages into instance
    > pip: ```sudo apt install python3-pip``` \
    > django ```sudo apt install python3-django``` \
    > djangorestframework ```sudo apt install python3-djangorestframework```\
    > django-cors-headers \
    ```sudo apt install python3-django-cors-headers```\
    > Node.js \
        >```curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - ```\
    ```sudo apt-get install -y nodejs```\
    > nginx
    ```sudo apt-get install nginx```
4. Send all local back end source code to EC2 instance to run it remotely instead of locally, while ignoring certain directories and files
    > Send Django app to a *recipes* directory
    ```
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    -e "ssh -i ~/.ssh/ny-josh-macbookair.pem" \
    . ubuntu@ec2-54-204-179-85.compute-1.amazonaws.com:~/recipes
    ```
    > Send *manage.py* to the root directory
    ```
    rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    -e "ssh -i ~/.ssh/ny-josh-macbookair.pem" \
    ./manage.py ubuntu@ec2-54-204-179-85.compute-1.amazonaws.com:~/
    ```

#### Linking front end code in S3 to back end code in EC2
1. Update *settings.py* in the django app to include \
    ```
    ALLOWED_HOSTS = ['54.204.179.85', 'http://community-recipes.s3-website.us-east-2.amazonaws.com/']
    ```
    This includes both the IP Address of the EC2 instance and the domain name of the S3 bucket to ensure proper communication between the two.
2. Update *settings.py* in the django app to include \
    ```
    CORS_ALLOWED_ORIGINS = [
    'http://community-recipes.s3-website.us-east-2.amazonaws.com',
    'https://community-recipes.s3-website.us-east-2.amazonaws.com']
    ```
    This allows the back end to receive http requests from the front end
3. Correct API_URL on front end to point to EC2 instance \
    ```const API_URL = 'http://54.204.179.85:8000/';```


## AWS CloudFront for CDN
1. Head to *CloudFront* dashboard in the AWS console
2. Click *Create a CloudFront distribution*
3. Select my s3 bucket as the *origin domain*
4. Select *Origin access control settings* to allow us to make the bucket private while any access to the files must be done through CloudFront
5. Click *Create new OAC*
6. In *Viewer Settings*, select *Redirect HTTP to HTTPS* to enable forwarding and *GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE* to allow users to manage all features of the app
7. Click *Create distribution*
8. Copy and edit the s3 bucket policy to give CloudFront access to the files and no one else \
    Allow access from http
    ```
    {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::community-recipes/*"
    }
    ```
    Allow access from CloudFront
    ```
    {
        "Sid": "AllowCloudFrontServicePrincipalRead",
        "Effect": "Allow",
        "Principal": {
            "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::community-recipes/*",
        "Condition": {
            "StringEquals": {
                "AWS:SourceArn": "arn:aws:cloudfront::975050060411:distribution/E1NJH4XQB3DRY0"
            }
        }
    }
    

## Update the code that is served over HTTPS and distributed over CloudFront
1. I could just reupload my files to my s3 bucket, but since CloudFront uses caching, I won't see any update for ~24 hours.
2. To update the page immediately , I need to tell my CloudFront distribution that there is an update to the file system and invalidate the caches.
3. In my CloudFront distrubution dashboard, navigate to the *Invalidations* tab and click *Create invalidation*
4. Add ```/*``` as my *Object path* to invalidate all the files 
    > To create a CLI command that'll create an invalidation every time I update my code, I added \
    ```"invalidate": "aws cloudfront create-invalidation --distribution-id E1NJH4XQB3DRY0 --paths '/*'",```

## Creating a custom VPC with one private subnet for EC2

#### Creating custom VPC
1. Head to *VPC dashboard* in the AWS console
2. Click *Create VPC*
3. Select *VPC only*
4. Create a name
5. Add an *IPv4 CIDR* (i.e. 10.0.0.0/16)
6. Click *Create VPC*

#### Creating one private subnet
1. Head to the *Subnets* tab in the *VPC dashboard*
2. Click *Create subnet*
3. Select my previously created custom VPC
4. Create a name
5. Choose *Availability Zone* (I chose *us-east-1a*)
6. Add an *IPv4 subnet CIDR block* (i.e 10.0.1.0/24) (must start with 10.0 to match that of the VPC)
7. Click *Create subnet*

#### Configuring EC2 instance details to be placed into custom VPC
1. Head to the *EC2 dashboard* 
2. Create an AMI from my existing EC2 Instance
    > Select the instance and click on *Actions* > *Image and Templates* > *Create Image*
3. Once the AMI is created, click *Launch instance from AMI* 
4. Create a name
5. Select your key pair name
6. Select the previously created VPC
7. Select the previously created private subnet
8. Disable *Auto-assign publicIP*
9. We now need to create an internet gateway in order to ssh into the new image of the EC2 instance
10. Head to the *Internet gateways* dashboard
11. Click *Create*
12. Create a name and launch
13. Click *Attach to a VPC* 
14. Select previously created VPC
15. Create a route table 
16. Head to the *Route tables* dashboard
17. Click *Create route table*
18. Create a name
19. Select previously created VPC
20. Click *Create route table*
21. Click *Edit routes*
22. Add a route that allows any other address that the instance connects with can be forwarded to the newly created internet gateway


Create another subnet for load balancer


AWS_ACCESS_KEY_ID="REPLACE_WITH_YOUR_KEY" \
AWS_SECRET_ACCESS_KEY="REPLACE_WITH_YOUR_SECRET" \
certbot --agree-tos -a certbot-s3front:auth \
--certbot-s3front:auth-s3-bucket REPLACE_WITH_YOUR_BUCKET_NAME \
[ --certbot-s3front:auth-s3-region your-bucket-region-name ] #(the default is us-east-1, unless you want to set it to something else, you can delete this line) \
[ --certbot-s3front:auth-s3-directory your-bucket-directory ] # (default is "") \
-i certbot-s3front:installer \
--certbot-s3front:installer-cf-distribution-id REPLACE_WITH_YOUR_CF_DISTRIBUTION_ID \
-d REPLACE_WITH_YOUR_DOMAIN