Parse.Cloud.beforeSave("AppJob", function (request, response) {
//    Parse.Cloud.useMasterKey();
    request.object.increment("runCounter");
    response.success();
});

Parse.Cloud.define("JobHistory", function (request, response) {
//    Parse.Cloud.useMasterKey();
    var results = [];
    var qJob = new Parse.Query("AppJob");
    var pageRows = request.params.pageRows
        , pageNo = request.params.pageNo
        ;

    if (!(pageRows)) {
        pageRows = 100;
    }

    if (!(pageNo) || (pageNo < 1)) {
        pageNo = 1;
    }
    qJob.equalTo("name", request.params.name);
    qJob.first().then(function (job) {
        if (job) {
            return {
                jobId: job.id
            }
        } else {
            return Parse.Promise.error("There is no such job or you aren't authenticated!");
        }
    }).then(function (objJob) {
            if (objJob.jobId) {
                var qJH = new Parse.Query("AppJobRunHistory");
                qJH.equalTo("jobIdText", objJob.jobId);
                qJH.skip((pageNo - 1) * pageRows);
                qJH.limit(pageRows);
                qJH.descending("createdAt");
                qJH.include("jobId");
                return qJH.find();
            } else {
                return Parse.Promise.as();
            }
        }).then(function (jobEntries) {
            var promise = Parse.Promise.as();
            _.each(jobEntries, function (jobEntry) {
                var iRow = -1
                    , dS, dE
                    ;
                var rowRet = {
                    job: jobEntry.get("jobId").get("name"),
                    runId: jobEntry.get("runCounter")
                };
                for (var i = 0; i < results.length; i++) {
                    if (results[i].runId == rowRet.runId) {
                        iRow = i;
                        break;
                    }
                }
                if (iRow == -1) {
                    results.push(rowRet);
                    iRow = results.length - 1;
                    results[iRow].errors = [];
                }
                if (jobEntry.get("isSuccess")) {
                    results[iRow].hasSuccess = "Yes";
                    results[iRow].success = JSON.stringify(jobEntry.get("statusObject"));
                }
                if (jobEntry.get("isError")) {
                    results[iRow].hasError = "Yes";
                    results[iRow].errors.push(JSON.stringify(jobEntry.get("statusObject")));
                    results[iRow].errorsCounter = results[iRow].errors.length;
                }
                if (!(results[iRow].start)) {
                    results[iRow].start = moment(jobEntry.createdAt).format("YYYY-MM-DDTHH:mm:ss");
                }
                if (moment(results[iRow].start).diff(moment(jobEntry.createdAt), "seconds") > 0) {
                    results[iRow].start = moment(jobEntry.createdAt).format("YYYY-MM-DDTHH:mm:ss");
                }
                if (!(results[iRow].end)) {
                    results[iRow].end = moment(jobEntry.createdAt).format("YYYY-MM-DDTHH:mm:ss");
                }
                if (moment(jobEntry.createdAt).diff(moment(results[iRow].end), "seconds") > 0) {
                    results[iRow].end = moment(jobEntry.createdAt).format("YYYY-MM-DDTHH:mm:ss");
                }

                dS = results[iRow].start;
                dE = results[iRow].end;

                results[iRow]["durationSeconds"] = moment.duration(moment(dE).diff(moment(dS), 'seconds'), 'seconds')._milliseconds / 1000;
                results[iRow]["duration"] = moment.duration(moment(dE).diff(moment(dS), 'seconds'), 'seconds').humanize();
                if (results[iRow].errors.length == 0) {
                    results[iRow].hasError = "No";
                }
            });
            response.success(results);
        }, function (error) {
            response.error(error);
        });
});


Parse.Cloud.define("JobStatus", function (request, response) {
//    Parse.Cloud.useMasterKey();
    var job = request.params
        , results = []
        ;
    var qJob = new Parse.Query("AppJob");
    if (job.name) {
        qJob.equalTo("name", job.name);
    }
    if (job.nameLike) {
        qJob.contains("name", job.nameLike);
    }
    if (job.nameList) {
        qJob.containedIn("name", job.nameList);
    }
    if (job.orderBy) {
        qJob.ascending(job.orderBy);
    } else {
        qJob.ascending("name");
    }

    qJob.find().then(function (jobs) {
        var promise = Parse.Promise.as()
            ;
        _.each(jobs, function (job) {
            promise = promise.then(function () {
                var jobAdd = {}
                    ;
                jobAdd["id"] = job.id;
                jobAdd["name"] = job.get("name");
                jobAdd["params"] = JSON.stringify(job.get("parameters"));
                jobAdd["iteration"] = job.get("runCounter");
                jobAdd["lastRunStart"] = moment(job.updatedAt).format();
                results.push(jobAdd);
                return jobAdd;
            }).then(function (jobAdd) {
                    var qJh = new Parse.Query("AppJobRunHistory");
                    qJh.equalTo("jobIdText", jobAdd.id);
                    qJh.equalTo("runCounter", jobAdd.iteration);
                    qJh.descending("createdAt");
                    return qJh.first();
                }).then(function (jobHistory) {
                    var jobId = -1
                        ;
                    if (jobHistory) {
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].id == jobHistory.get("jobIdText")) {
                                jobId = i;
                                break;
                            }
                        }
                    }
                    if (jobId > -1) {
                        results[jobId]["lastRunEnd"] = moment(jobHistory.createdAt).format();
                        results[jobId]["lastRunStatus"] = jobHistory.get("status");
                        results[jobId]["lastRunStatusResult"] = JSON.stringify(jobHistory.get("statusObject"));
                    }
                    return Parse.Promise.as();
                }).then(function () {

                })
        });
        return promise;
    }).then(function () {
            for (var i = 0; i < results.length; i++) {
                var dS = results[i].lastRunStart
                    , dE = results[i].lastRunEnd
                    ;
                if ((dS) && (dE)) {
                    results[i]["durationSeconds"] = moment.duration(moment(dE).diff(moment(dS), 'seconds'), 'seconds')._milliseconds / 1000;
                    results[i]["duration"] = moment.duration(moment(dE).diff(moment(dS), 'seconds'), 'seconds').humanize();
                }
            }
            response.success(results);
        }, function (error) {
            response.error(error);
        });
});


var AddJobRunHistory;
AddJobRunHistory = function (request) {
    Parse.Cloud.useMasterKey();
    var promise = new Parse.Promise();
    var NewJobRun = Parse.Object.extend("AppJobRunHistory")
        ;

    NewJobRun = new NewJobRun();
    NewJobRun.set("name", request.name);
    NewJobRun.set("jobId", request.jobId);
    NewJobRun.set("jobIdText", request.jobIdText);
    NewJobRun.set("runCounter", request.runCounter);
    NewJobRun.set("parameters", request.parameters);
    NewJobRun.set("status", request.status);
    NewJobRun.set("statusObject", request.statusObject);
    NewJobRun.set("isSuccess", (request.status == "success"));
    NewJobRun.set("isError", (request.status == "error"));
    NewJobRun.set("isOther", ((request.status != "success") && (request.status != "error")));
    NewJobRun.setACL(_getAdminACL());

    NewJobRun.save().then(function (jrs) {
        promise.resolve({});
    }, function (error) {
        promise.reject(error);
    });
    return promise;
};

var AddJobRunCounter;
AddJobRunCounter = function (request) {
    Parse.Cloud.useMasterKey();
    var jobId
        , jobRunId
        , jobName = request.name
        ;
    var promise = new Parse.Promise();
    var qJob = new Parse.Query("AppJob");
    qJob.equalTo("name", jobName);
    qJob.first().then(function (job) {
        if (job) {
            job.set("parameters", request.parameters);
            return job.save();
        } else {
            var NewJob = Parse.Object.extend("AppJob")
                ;
            NewJob = new NewJob();
            NewJob.set("name", jobName);
            NewJob.set("parameters", request.parameters);
            NewJob.setACL(_getAdminACL());
            return NewJob.save();
        }
    }).then(function (jobSaved) {
            jobId = jobSaved.id;
            jobRunId = jobSaved.get("runCounter");
            return AddJobRunHistory({
                name: jobSaved.get("name"),
                jobId: _parsePointer("AppJob", jobId),
                jobIdText: jobId,
                runCounter: jobRunId,
                parameters: request.parameters,
                status: "start",
                statusObject: {}
            });
        }).then(function (jobHSaved) {
            promise.resolve({
                jobId: jobId,
                jobRunCounter: jobRunId
            });
        }, function (error) {
            promise.reject(error);
        });
    return promise;
};
