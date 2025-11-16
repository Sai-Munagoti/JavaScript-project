# Start from the official Jenkins LTS image
FROM jenkins/jenkins:lts

# Switch to the root user to install software
USER root

# Install Docker CLI so Jenkins can interact with Docker
RUN apt-get update && \
    apt-get install -y --no-install-recommends docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Maven to build the Java project
RUN apt-get update && \
    apt-get install -y --no-install-recommends maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js and npm for the Node.js project
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js and npm installation
RUN node --version && npm --version

# Add the 'jenkins' user to the 'docker' group to grant permissions
RUN usermod -aG docker jenkins

# Install SonarQube Scanner
RUN wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip && \
    unzip -q sonar-scanner-cli-4.8.0.2856-linux.zip -d /opt && \
    mv /opt/sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner && \
    rm sonar-scanner-cli-4.8.0.2856-linux.zip && \
    ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner

# Pre-install the Jenkins plugins we need for the pipeline
RUN jenkins-plugin-cli --plugins \
    git \
    workflow-aggregator \
    docker-workflow \
    sonar \
    nexus-artifact-uploader \
    credentials-binding \
    config-file-provider \
    nodejs

# Switch back to the standard 'jenkins' user
USER jenkins
