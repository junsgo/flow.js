var flow = require(__dirname + '/../lib/flow').flow,
    Flow = require(__dirname + '/../lib/flow').Flow,
    should = require('chai').should();

describe('Flow', function () {
    describe('#exec()', function () {
        it('empty flow should exec without errors', function (done) {
            flow()
                .exec(function (err, data) {
                    should.not.exist(err);

                    done();
                })
        });

        it('should always call callback if exec', function (done) {
            flow()
                .seq(function (cb) {
                    cb(null);
                })
                .exec(function (err, vars) {
                    done();
                });

        });

        it('should not execute flow if exec isn\'t called', function (done) {

            var a;

            flow()
                .seq(function (cb) {
                    a = 1;
                });

            setTimeout(function () {
                should.not.exist(a);
                done();
            }, 10);

        });

        it('exception in exec should call errorHandler', function (done) {

            var f = flow();
            f.errorHandler = function (e) {
                done();
            };

            f.exec(function () {
                throw "error";
            });

        });

    });

    describe('#seq()', function () {
        it('synchron sequence', function (done) {
            flow()
                .seq(function () {
                    // synchron
                })
                .exec(function (err, data) {
                    should.not.exist(err);

                    done();
                })
        });

        it('synchron sequence', function (done) {
            flow()
                .seq(function (cb) {
                    setTimeout(function () {
                        cb(null)
                    }, 20);
                })
                .exec(function (err, vars) {
                    should.not.exist(err);

                    done();
                });
        });

        it('synchron sequence with name should set var', function (done) {
            flow()
                .seq("x", function () {
                    // synchron
                    return "y";
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x');
                    results.x.should.eql("y");
                    Object.keys(results).length.should.eql(1);

                    done();
                })
        });

        it('asynchron sequence with name should set var', function (done) {
            flow()
                .seq("x", function (cb) {
                    // asychron
                    cb(null, "y");
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x');
                    results.x.should.eql("y");
                    Object.keys(results).length.should.eql(1);

                    done();
                })
        });

        it('asynchron sequence with unhandled exception', function (done) {
            flow()
                .seq(function (cb) {
                    throw "unexpected error";

                    // asychron
                    cb();
                })
                .exec(function (err, results) {
                    should.exist(err);

                    done();
                })
        });


        it('sequence should execute after each', function (done) {

            var x;

            flow()
                .seq(function (cb) {
                    // asynchron
                    setTimeout(function () {
                        x = 123;
                        cb(null);
                    }, 5);
                })
                .seq(function () {
                    // synchron
                    should.exist(x);
                    x.should.eql(123);
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    done();
                })
        });

        it('two sequence should execute after each and set vars', function (done) {
            flow()
                .seq("x", function (cb) {
                    // asynchron
                    setTimeout(function () {
                        cb(null, "x")
                    }, 5);
                })
                .seq("y", function () {
                    // synchron
                    this.vars.should.have.property('x');
                    this.vars.x.should.eql('x');
                    return "y";
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    results.should.have.ownProperty('x');
                    results.x.should.eql("x");
                    results.should.have.ownProperty('y');
                    results.y.should.eql("y");

                    Object.keys(results).length.should.eql(2);

                    done();
                })
        });


        it('synchron sequence throwing error should add error in exec', function (done) {
            flow()
                .seq(function () {
                    throw "error"
                })
                .exec(function (err, results) {
                    should.exist(err);
                    done();
                })
        });

        it('asynchron sequence throwing error should add error in exec', function (done) {
            flow()
                .seq(function (cb) {
                    cb("error");
                })
                .exec(function (err, results) {
                    should.exist(err);
                    done();
                })
        });

        it('error in sequence should interrupt flow', function (done) {

            var x;

            flow()
                .seq(function (cb) {
                    cb("error");
                })
                .seq(function () {
                    x = 123;
                })
                .exec(function (err, results) {
                    should.exist(err);
                    should.not.exist(x);
                    done();
                })
        });


        it('passing no function to sequence should fails', function (done) {

            try {
                flow()
                    .seq()
                    .exec(function (err, results) {
                        throw "Exec should be executed";
                    });
            } catch (e) {
                done()
            }
        });

        it('passing no function to sequence should fails even with var name', function (done) {

            try {
                flow()
                    .seq("x")
                    .exec(function (err, results) {
                        throw "Exec should be executed";
                    });
            } catch (e) {
                done()
            }
        });


    });


    describe('#par()', function () {


        it('empty parallel', function (done) {
            flow()
                .par([])
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('empty parallel with vars', function (done) {
            flow()
                .par({})
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('sychron parallel', function (done) {

            var x, y, z;

            flow()
                .par([
                function () {
                    x = 1;
                },
                function () {
                    y = 2;
                },
                function () {
                    z = 3;
                }
            ])
                .exec(function (err, results) {

                    should.not.exist(err);

                    should.exist(x);
                    should.exist(y);
                    should.exist(z);
                    x.should.eql(1);
                    y.should.eql(2);
                    z.should.eql(3);

                    done();
                })
        });

        it('asychron parallel', function (done) {

            var x, y, z;

            flow()
                .par([
                function (cb) {
                    setTimeout(function () {
                        x = 1;
                        cb(null);
                    }, 20);
                },
                function (cb) {
                    setTimeout(function () {
                        y = 2;
                        cb(null);
                    }, 20);
                },
                function (cb) {
                    setTimeout(function () {
                        z = 3;
                        cb(null);
                    }, 20);
                }
            ])
                .exec(function (err) {
                    should.not.exist(err);

                    should.exist(x);
                    should.exist(y);
                    should.exist(z);
                    x.should.eql(1);
                    y.should.eql(2);
                    z.should.eql(3);

                    done();
                })
        });

        it('asychron parallel with unhandled exception', function (done) {

            var x, y, z;

            flow()
                .par([
                function (cb) {
                    setTimeout(function () {
                        x = 1;
                        cb(null);
                    }, 20);
                },
                function (cb) {

                    throw "unhandled exception";

                    setTimeout(function () {
                        y = 2;
                        cb(null);
                    }, 20);
                }
            ])
                .exec(function (err) {

                    should.not.exist(x);
                    should.not.exist(y);
                    should.exist(err);

                    done();
                })
        });


        it('sychron parallel 2', function (done) {

            flow()
                .par({
                    a: function () {
                        return 1;
                    },
                    b: function () {
                        return 2;
                    },
                    c: function () {
                        return 3;
                    }
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results);
                    results.should.have.property('a');
                    results.should.have.property('b');
                    results.should.have.property('c');

                    done();
                })
        });


        it('asychron parallel set vars', function (done) {

            flow()
                .par({
                    a: function (cb) {
                        setTimeout(function () {
                            cb(null, 1);
                        }, 20);
                    },
                    b: function (cb) {
                        setTimeout(function () {
                            cb(null, 2);
                        }, 20);
                    },
                    c: function (cb) {
                        setTimeout(function () {
                            cb(null, 3);
                        }, 20);
                    }
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results);
                    results.should.have.property('a');
                    results.should.have.property('b');
                    results.should.have.property('c');

                    results.a.should.eql(1);
                    results.b.should.equal(2);
                    results.c.should.eql(3);

                    done();
                })
        });

        it('exception in synchron parallel tasks should not set a var and call exec', function (done) {

            flow()
                .par({
                    a: function () {
                        return 1;
                    },
                    b: function () {
                        throw "error";
                    },
                    c: function () {
                        return 2;
                    }
                })
                .exec(function (err, results) {
                    should.exist(err);

                    results.should.not.have.property('a');
                    results.should.not.have.property('b');
                    results.should.not.have.property('c');

                    done();
                })
        });

        it('use comma separated syntax', function (done) {

            var a, b;

            flow()
                .par(function () {
                    a = 1;
                },
                function (cb) {
                    setTimeout(function () {
                        b = 2;
                        cb(null);
                    }, 20);
                }
            )
                .exec(function (err) {
                    should.not.exist(err);

                    a.should.eql(1);
                    b.should.eql(2);

                    done();
                })
        });

        it('use comma separated syntax, throw error', function (done) {

            flow()
                .par(function () {
                    throw "err";
                },
                function (cb) {
                    setTimeout(function () {
                        cb(null);
                    }, 20);
                }
            )
                .exec(function (err) {
                    should.exist(err);

                    done();
                })
        });


    });


    describe('#parEach()', function () {


        it('empty parEach', function (done) {
            flow()
                .parEach([], function (value) {
                })
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('empty parallel with vars', function (done) {
            flow()
                .par({})
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('sychron parEach', function (done) {

            var x, y, z,
                xIndex, yIndex, zIndex;

            flow()
                .parEach([1, 2, 3], function (value) {
                    switch (value) {
                        case 1:
                            x = value;
                            xIndex = this.key;
                            break;
                        case 2:
                            y = value;
                            yIndex = this.key;
                            break;
                        case 3:
                            z = value;
                            zIndex = this.key;
                            break;
                    }
                })
                .exec(function (err) {

                    should.not.exist(err);

                    should.exist(x);
                    should.exist(y);
                    should.exist(z);

                    should.exist(xIndex);
                    should.exist(yIndex);
                    should.exist(zIndex);

                    x.should.eql(1);
                    y.should.eql(2);
                    z.should.eql(3);

                    xIndex.should.eql(0);
                    yIndex.should.eql(1);
                    zIndex.should.eql(2);

                    done();
                })
        });

        it('asychron parEach with key', function (done) {

            var x, y, z,
                xIndex, yIndex, zIndex;

            flow()
                .parEach([1, 2, 3], function (value, key, cb) {
                    setTimeout(function () {
                        switch (value) {
                            case 1:
                                x = value;
                                xIndex = key;
                                break;
                            case 2:
                                y = value;
                                yIndex = key;
                                break;
                            case 3:
                                z = value;
                                zIndex = key;
                                break;
                        }
                        cb()
                    }, 10);
                })
                .exec(function (err) {

                    should.not.exist(err);

                    should.exist(x);
                    should.exist(y);
                    should.exist(z);

                    should.exist(xIndex);
                    should.exist(yIndex);
                    should.exist(zIndex);

                    x.should.eql(1);
                    y.should.eql(2);
                    z.should.eql(3);

                    xIndex.should.eql(0);
                    yIndex.should.eql(1);
                    zIndex.should.eql(2);

                    done();
                })
        });

        it('asychron parEach', function (done) {

            var x, y, z,
                xIndex, yIndex, zIndex;

            flow()
                .parEach([1, 2, 3], function (value, cb) {
                    var self = this;
                    setTimeout(function () {
                        switch (value) {
                            case 1:
                                x = value;
                                xIndex = self.key;
                                break;
                            case 2:
                                y = value;
                                yIndex = self.key;
                                break;
                            case 3:
                                z = value;
                                zIndex = self.key;
                                break;
                        }
                        cb()
                    }, 10);
                })
                .exec(function (err) {

                    should.not.exist(err);

                    should.exist(x);
                    should.exist(y);
                    should.exist(z);

                    should.exist(xIndex);
                    should.exist(yIndex);
                    should.exist(zIndex);

                    x.should.eql(1);
                    y.should.eql(2);
                    z.should.eql(3);

                    xIndex.should.eql(0);
                    yIndex.should.eql(1);
                    zIndex.should.eql(2);

                    done();
                })
        });

        it('sychron parEach with variables', function (done) {

            var keys = [];

            flow()
                .parEach({
                    a: 1,
                    b: 2,
                    c: 3
                }, function (value) {
                    keys[value - 1] = this.key;

                    return value * 3;
                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results);
                    results.should.have.property('a');
                    results.a.should.eql(3);
                    results.should.have.property('b');
                    results.b.should.eql(6);
                    results.should.have.property('c');
                    results.c.should.eql(9);

                    keys.should.eql(["a", "b", "c"]);

                    done();
                })
        });

        it('asychron parEach with variables', function (done) {

            var keys = [];

            flow()
                .parEach({
                    a: 1,
                    b: 2,
                    c: 3
                }, function (value, cb) {

                    keys[value - 1] = this.key;

                    setTimeout(function () {
                        cb(null, value * 3);
                    }, 10)

                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results);
                    results.should.have.property('a');
                    results.a.should.eql(3);
                    results.should.have.property('b');
                    results.b.should.eql(6);
                    results.should.have.property('c');
                    results.c.should.eql(9);

                    keys.should.eql(["a", "b", "c"]);

                    done();
                })
        });

        it('asychron parEach with variables and key', function (done) {

            var keys = [];

            flow()
                .parEach({
                    a: 1,
                    b: 2,
                    c: 3
                }, function (value, key, cb) {

                    keys[value - 1] = this.key + key;

                    setTimeout(function () {
                        cb(null, value * 3);
                    }, 10);

                })
                .exec(function (err, results) {
                    should.not.exist(err);

                    should.exist(results);
                    results.should.have.property('a');
                    results.a.should.eql(3);
                    results.should.have.property('b');
                    results.b.should.eql(6);
                    results.should.have.property('c');
                    results.c.should.eql(9);

                    keys.should.eql(["aa", "bb", "cc"]);

                    done();
                })
        });

        it('exception in synchron parEach tasks should not set a var and call exec', function (done) {

            flow()
                .parEach({
                    a: -1,
                    b: 0,
                    c: 1
                }, function (value) {

                    if (value === 0) {
                        throw "div by zero";
                    }

                    return (1 / value);
                })
                .exec(function (err, results) {
                    should.exist(err);

                    results.should.not.have.property('a');
                    results.should.not.have.property('b');
                    results.should.not.have.property('c');

                    done();
                })
        });

        it('exception in asynchron parEach tasks should not set a var and call exec', function (done) {

            var methods = {
                a: function (cb) {
                    cb();
                },

                b: function (cb) {
                    setTimeout(function () {
                        // some error
                        cb("error");
                    }, 1);
                },

                c: function (cb) {
                    setTimeout(cb, 1);
                }
            };

            flow()
                .parEach(methods, function (value, cb) {
                    value(cb);
                })
                .exec(function (err, results) {
                    should.exist(err);
                    err.should.eql("error");

                    results.should.not.have.property('a');
                    results.should.not.have.property('b');
                    results.should.not.have.property('c');

                    done();
                });
        });

        it('2nd argument for parEach needs to be a function', function (done) {

            try {
                flow()
                    .parEach({
                        a: -1,
                        b: 0,
                        c: 1
                    })
                    .exec(function () {
                    })
            } catch (e) {
                e.should.eql("2nd argument for parEach needs to be a function");
                done();
            }
        });

    });

    describe('#seqEach()', function () {


        it('empty seqEach', function (done) {
            flow()
                .seqEach([], function (value) {
                    throw "should not be called";
                })
                .exec(function (err) {
                    should.not.exist(err);

                    done();
                })
        });

        it('synchron seqEach', function (done) {

            var a, b, c,
                keys = [];

            flow()
                .seqEach([1, 2, 3], function (value) {

                    keys[this.key] = value;

                    if (value === 1) {
                        should.not.exist(a);
                        should.not.exist(b);
                        should.not.exist(c);
                        a = value;
                    }

                    if (value === 2) {
                        should.exist(a);
                        a.should.eql(1);
                        should.not.exist(b);
                        should.not.exist(c);
                        b = value;
                    }

                    if (value === 3) {
                        should.exist(a);
                        a.should.eql(1);
                        should.exist(b);
                        b.should.eql(2);
                        should.not.exist(c);
                        c = value;
                    }
                })
                .exec(function (err) {
                    should.not.exist(err);
                    should.exist(a);
                    a.should.eql(1);
                    should.exist(b);
                    b.should.eql(2);
                    should.exist(c);
                    c.should.eql(3);

                    keys.should.eql([1, 2, 3]);
                    done();
                })
        });

        it('asynchron seqEach', function (done) {

            var a, b, c,
                keys = [];

            flow()
                .seqEach(["a", "b", "c"], function (value, key, cb) {
                    setTimeout(function () {
                        keys[key] = value;
                        cb();
                    }, 10);
                })
                .exec(function (err) {
                    should.not.exist(err);

                    keys.should.eql(["a", "b", "c"]);
                    done();
                })
        });


    });

    describe('#end()', function () {
        it('end in syncron sequence', function (done) {

            var a, b, c;

            flow()
                .seq("a", function () {
                    a = 1;
                    return 1;
                })
                .seq("b", function () {
                    b = 2;
                    this.end();

                    return 2;
                })
                .seq("c", function () {
                    // should not be executed
                    c = 3;
                    return 3;
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    should.exist(a);
                    should.exist(b);
                    should.not.exist(c);
                    results.should.have.ownProperty("a");
                    results.should.have.ownProperty("b");
                    results.should.not.have.ownProperty("c");
                    results.a.should.eql(1);
                    results.b.should.eql(2);
                    a.should.eql(1);
                    b.should.eql(2);

                    done();
                })
        });

        it('end in async sequence', function (done) {

            var a, b, c;

            flow()
                .seq("a", function (cb) {
                    setTimeout(function () {
                        a = 1;
                        cb(null, 1);
                    }, 10);
                })
                .seq("b", function (cb) {
                    setTimeout(function () {
                        b = 2;
                        cb.end(null, 2);
                    }, 10);
                })
                .seq("c", function (cb) {
                    // should not be executed
                    setTimeout(function () {
                        c = 3;
                        cb();
                    }, 10);
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    should.exist(a);
                    should.exist(b);
                    should.not.exist(c);
                    results.should.have.ownProperty("a");
                    results.should.have.ownProperty("b");
                    results.should.not.have.ownProperty("c");
                    results.a.should.eql(1);
                    results.b.should.eql(2);
                    a.should.eql(1);
                    b.should.eql(2);

                    done();
                })
        });

        it('end in parallel actions should ', function (done) {

            var a, b, c;

            flow()
                .seq("a", function () {
                    a = 1;
                    return 1;
                })
                .seq("b", function () {
                    b = 2;
                    this.end();

                    return 2;
                })
                .seq("c", function () {
                    // should not be executed
                    c = 3;
                    return 3;
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    should.exist(a);
                    should.exist(b);
                    should.not.exist(c);
                    results.should.have.ownProperty("a");
                    results.should.have.ownProperty("b");
                    results.should.not.have.ownProperty("c");
                    results.a.should.eql(1);
                    results.b.should.eql(2);
                    a.should.eql(1);
                    b.should.eql(2);

                    done();
                })
        });

        it('multiple end actions in parallel, should call action callback only once', function (done) {

            var a, b, c;

            flow()
                .par({
                    a: function () {
                        this.end();
                    },
                    b: function () {
                        this.end();
                    }
                })
                .seq(function () {
                    c = 1;
                    throw "should not executed"
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    should.not.exist(c);

                    results.should.not.have.ownProperty('a');
                    results.should.not.have.ownProperty('b');

                    done();
                })
        });


        it('end in synchron sequence with error', function (done) {

            flow()
                .seq("a", function () {
                    this.end();
                    throw "error"
                })
                .seq("b", function () {
                    return 0;
                })
                .exec(function (err, results) {
                    should.exist(err);
                    should.exist(results);
                    results.should.not.have.ownProperty('a');
                    results.should.not.have.ownProperty('b');

                    done();
                })
        });

        it('multiple end', function (done) {

            var execCount = 0;

            flow()
                .seq(function () {
                    this.end();
                    this.end();
                })
                .exec(function (err) {
                    should.not.exist(err);
                    execCount++;

                    setTimeout(function () {
                        execCount.should.eql(1);
                        done();
                    }, 10);

                })
        });

        it('end and callback', function (done) {

            var execCount = 0;

            flow()
                .seq(function (cb) {
                    this.end();
                    cb();
                })
                .seq(function () {
                    throw "should not cal this block"
                })
                .exec(function (err) {
                    execCount++;

                    setTimeout(function () {
                        execCount.should.eql(1);
                        done();
                    }, 10);

                })
        });

    });

    describe('sub flows', function () {
        it('subflow should in own context', function (done) {

            flow()
                .seq("a", function () {
                    return 1;
                })
                .seq("b", function (cb) {
                    flow()
                        .exec(function (err, results) {
                            should.exist(results) && should.not.exist(err) &&
                            results.should.not.have.ownProperty('a');

                            cb(err, 2);
                        });

                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    results.should.have.ownProperty("a");
                    results.should.have.ownProperty("b");
                    results.a.should.eql(1);
                    results.b.should.eql(2);

                    done();
                })
        });

        it('chaining sub flows', function (done) {

            var a, b, c;

            flow()
                .seq(function (cb) {

                    flow()
                        .seq(function () {
                            a = 1;
                        })
                        .par([
                        function () {
                            b = 2;
                        },
                        function (cb) {
                            setTimeout(function () {
                                c = 3;
                                cb();
                            }, 10);
                        }
                    ])
                        .exec(cb);
                })
                .seq(function () {
                    should.exist(a);
                    should.exist(b);
                    should.exist(c);
                })
                .exec(function (err, results) {
                    should.not.exist(err);
                    should.exist(results);
                    done();
                });
        });

        it('error in sub flows', function (done) {

            flow()
                .seq(function (cb) {
                    flow()
                        .seq(function () {
                            throw "some error"
                        })
                        .exec(cb);
                })
                .exec(function (err, results) {
                    should.exist(err);
                    err.should.eql("some error");
                    done();
                });
        });


    });

})
;