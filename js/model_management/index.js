//created by mxx

//预览场景的建立
//开启three.js渲染器
var renderer, controls;

function initThree(){
    width = document.getElementById('canvas3d').clientWidth;
    height = document.getElementById('canvas3d').clientHeight;
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    document.getElementById('canvas3d').appendChild(renderer.domElement);
    renderer.setClearColor(0xffffff, 1.0);//设置canvas背景色和透明度
}

//设置相机
var camera;
function initCamera(){
    camera = new THREE.PerspectiveCamera(45, width/height, 1, 5000);
    camera.position.x = 0;//设置相机位置坐标
    camera.position.y = 0;
    camera.position.z = 2000;
    camera.up.y = 1;
    camera.lookAt({x:0, y:0, z:0});//设置视野中心坐标
}

//设置场景
var scene;
function initScene(){
    scene = new THREE.Scene();
}

//设置光源
var light;
function initLight(){
    light = new THREE.DirectionalLight(0x00ff00, 1.0, 0);
    light.position.set(2000, 2000, 2000);
    scene.add(light);
}

//初始化所有条件
function threeStart(){
    initThree();
    initCamera();
    initScene();
    initLight();
    changeToChinese();
    fresh();
    renderer.render(scene, camera);
}
//预览场景结束

//添加本地文件
var flag = true;
function addObj(){
    renderer.clear();
    scene.add(obj);
    renderer.render(scene, camera);
    flag = 1;
    clearInterval(timer);
}

function loadModel(no,id){
    $("#models0").hide();
    $("#models1").hide();
    $("#models2").hide();
    $("#models"+no).show();
    loader.load( '../resource/model/'+id+'.obj','../resource/model/'+id+'.mtl', function ( object ) {
        var i;
        for(i=0; i<obj.children.length; i++) {
            var obj2 = obj.children[i];
            obj.remove(obj2);
        }
        obj.add( object );
        renderer.clear();
        renderer.render(scene, camera);
    });

//调试模型大小至合适大小
    obj.rotation.x = Math.PI / 5;
    obj.rotation.y = Math.PI / 5;
    obj.scale.x = 50;
    obj.scale.y = 50;
    obj.scale.z = 50;
    addObj();
}

//设置自动旋转
var timer;
function auto(){
    renderer.clear();
    renderer.render(scene, camera);
    if (flag == 1) {
        timer = setInterval("run()", 10);
        flag = 0;
    }
}

//设置手动旋转
function orbit(){
    clearInterval(timer);
    controls = new THREE.OrbitControls( camera, renderer.domElement);
    controls.addEventListener( 'change',  render);
    flag = 1;
}

function render(){
    renderer.render(scene, camera);
}

var obj = new THREE.Object3D();//新建一个全局变量读取下面加载的物体

//加载从本地读取的文件
var loader = new THREE.OBJMTLLoader();

//让模型转起来
var animating = true;
function run(){
    renderer.clear();
    renderer.render(scene, camera);
    if (animating){
        obj.rotation.y -= -0.01;
    }
}

//刷新页面语言
function fresh() {
    document.getElementById("welcome").innerHTML = Language.welcome;
    document.getElementById("totalFolder").innerHTML = Language.totalFolder;
    document.getElementById("totalModel").innerHTML = Language.totalModel;

    document.getElementById("addFolder").innerHTML = Language.addFolder;
    document.getElementById("delFolder").innerHTML = Language.delFolder;
    document.getElementById("delModel").innerHTML = Language.delModel;

    document.getElementById("selectMtl").innerHTML = Language.selectMtl;
    document.getElementById("selectObj").innerHTML = Language.selectObj;

    //$("#selectMtl").text(Language.selectMtl);
    document.getElementById("preview").innerHTML = Language.preview;
    document.getElementById("upload").innerHTML = Language.upload;
    document.getElementById("effectPic").innerHTML = Language.effectPic;
    document.getElementById("auto").innerHTML = Language.auto;
    document.getElementById("manual").innerHTML = Language.manual;
}

function start(){
    var usernamevalue = window.sessionStorage.getItem("userName");
    document.getElementById("userNameValue").innerHTML = usernamevalue;
    AV.initialize('5dIY14evaxRpe5WNkS8lgz2A', 'Lz0FpW2NYF1io7vS2hIlEDEU');
    setTotalFolder();
    setTotalModel();
    showFolders();

    //showModels();
}

function setTotalFolder(){
    var query = new AV.Query(Folder);
    query.equalTo("owner", "me");
    query.find({
        success: function (results) {
            document.getElementById("totalFolderValue").innerHTML = results.length;
        }
    }, {
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

function setTotalModel(){
    var query = new AV.Query(Model);
    query.equalTo("owner", "me");
    query.find({
        success: function (results) {
            document.getElementById("totalModelValue").innerHTML = results.length;
        }
    }, {
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

//新建leancloud存储数据
var Folder = AV.Object.extend("Folder");
var Model = AV.Object.extend("Model");

function addFolder() {
    var folderName = prompt("请输入文件夹名字", "未命名"); //将输入的内容赋给变量 name ，
    //这里需要注意的是，prompt有两个参数，前面是提示的话，后面是当对话框出来后，在对话框里的默认值
    var folder = AV.Object.new('Folder');
    folder.set("folderName", folderName);
    folder.set("owner", "me");
    folder.set("addTime", "time1");
    var name = folder.get("folderName");
    folder.save(null, {
        success: function () {
            // 成功保存之后，执行其他逻辑.
            alert('Folder ' + name + ' add successfully!');
            showFolders();
            setTotalFolder();
        },
        error: function (error) {
            // 失败之后执行其他逻辑
            // error 是 AV.Error 的实例，包含有错误码和描述信息.
            alert('Failed to add folder ' + name + error.message);
        }
    });
}

function delFolder(){
    var checkedFolder = $("#folders input[name='checkbox']:checked");
    checkedFolder.each(function(){
        var checkedName = $(checkedFolder).parent().find("a").text();
        if (checkedName == "默认文件夹"){
            alert("该文件夹无法删除");
            return false;
        }
        else {
            var query1 = new AV.Query(Model);
            query1.equalTo('folderName', checkedName);
            query1.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {

                        var model = results[i];
                        var id =  model.id;
                        var query2 = new AV.Query(Model);
                        query2.get(id, {
                            success: function(model) {
                                // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
                                model.set('folderName', '默认文件夹');
                                model.save();
                            },
                            error: function(object, error) {
                                // 失败了.
                                console.log(object);
                            }
                        });
                    }
                }
            });
            var query = new AV.Query(Folder);
            query.equalTo('folderName', checkedName);
            query.destroyAll({
                success: function () {
                    // 成功删除 query 命中的所有实例.
                    showFolders();
                },
                error: function (err) {
                    // 失败了.
                }
            });
        }
    });
    alert("删除成功！");
}

var selectedFolder;

function showFolders() {
    var query = new AV.Query(Folder);
    query.equalTo('owner', 'me');
    query.find({
        success: function(results) {
            document.getElementById("folders").innerHTML = "";
            for (var i = 0; i < results.length; i++) {
                var fname = results[i].get("folderName");
                $("#folders").append("<div><input type='checkbox' class='check' name='checkbox'> <li id='folder" + i + "'> <a href='#'>" + fname + "</a> </li></div>");
            }
            $("a").on("click",function(){
                $("#folders").find("a").removeClass("color");
                selectedFolder = $(this).text();
                $(this).addClass("color");
                showModels(selectedFolder);
            });
            $("a").dblclick(function(){
                var prename = $(this).text();
                var rename =  prompt("请输入重命名名称", prename);
                var query1 = new AV.Query(Folder);
                query1.equalTo('folderName', prename);
                query1.find({
                    success: function(results) {
                        //results.set("folderName", rename);
                        for (var i = 0; i < results.length; i++) {
                            var model = results[i];
                            var id =  model.id;
                            var query2 = new AV.Query(Folder);
                            query2.get(id, {
                                success: function(model) {
                                    // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
                                    model.set('folderName', rename);
                                    model.save();
                                    window.location.reload();
                                },
                                error: function(object, error) {
                                    // 失败了.
                                    console.log(object);
                                }
                            });
                        }
                    },
                    error: function(error) {
                        console.log('Error: ' + error.code + ' ' + error.message);
                    }
                });
            });
        },
        error: function(error) {
            console.log('Error: ' + error.code + ' ' + error.message);
        }
    });
}

var selectedModel;
function showModels(fname){
    var query = new AV.Query(Model);
    query.equalTo('folderName', fname);
    query.find({
        success: function (results) {
            document.getElementById("models").innerHTML = "";
            for (var i = 0; i < results.length; i++) {
                $("#models").append("<div><input type='checkbox' class='check' name='checkbox2'> <li id='model" + i + "'> <a href='#'>" + results[i].get("modelName") + "</a> </li></div>");
            }
            $("a").on("click",function(){
                $("#models").find("a").removeClass("color");
                selectedModel = $(this).text();
                $(this).addClass("color");
                showModel(selectedModel);
            });
            $("a").dblclick(function(){
                var prename = $(this).text();
                var rename =  prompt("请输入重命名名称", prename);
                var query1 = new AV.Query(Model);
                query1.equalTo('modelName', prename);
                query1.find({
                    success: function(results) {
                        //results.set("folderName", rename);
                        for (var i = 0; i < results.length; i++) {
                            var model = results[i];
                            var id =  model.id;
                            var query2 = new AV.Query(Model);
                            query2.get(id, {
                                success: function(model) {
                                    // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
                                    model.set('modelName', rename);
                                    model.save();
                                    window.location.reload();
                                },
                                error: function(object, error) {
                                    // 失败了.
                                    console.log(object);
                                }
                            });
                        }
                    },
                    error: function(error) {
                        console.log('Error: ' + error.code + ' ' + error.message);
                    }
                });
            });
        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

function delModel(){
    var checkedModel = $("#models input[name='checkbox2']:checked");
    checkedModel.each(function(){
        var checkedName = $(checkedModel).parent().find("a").text();
        alert(checkedName);
        var query = new AV.Query(Model);
        query.equalTo('modelName', checkedName);
        query.destroyAll({
            success: function(){
                // 成功删除 query 命中的所有实例.
                showModels(selectedFolder);
            },
            error: function(err){
                // 失败了.
            }
        });
    });
    alert("删除成功！");
}

function uploadModel(){
    var modelName = prompt("请输入模型名字", "未命名"); //将输入的内容赋给变量 name ，
    //这里需要注意的是，prompt有两个参数，前面是提示的话，后面是当对话框出来后，在对话框里的默认值
    var model = AV.Object.new('Model');
    model.set("modelName", modelName);
    model.set("folderName", selectedFolder);
    model.set("owner", "me");
    model.set("addTime", "time1");
    var name = model.get("modelName");
    model.save(null, {
        success: function () {
            // 成功保存之后，执行其他逻辑.
            alert('Model ' + name + ' add successfully!');
            showModels(selectedFolder);
            setTotalModel();
        },
        error: function (error) {
            // 失败之后执行其他逻辑
            // error 是 AV.Error 的实例，包含有错误码和描述信息.
            alert('Failed to add model ' + name + error.message);
        }
    });
}

function showModel(selectedModel){
    loader.load( '../resource/model/'+ selectedModel +'.obj','../resource/model/'+ selectedModel +'.mtl', function ( object ) {
        var i;
        for(i=0; i<obj.children.length; i++) {
            var obj2 = obj.children[i];
            obj.remove(obj2);
        }
        obj.add( object );
        renderer.clear();
        renderer.render(scene, camera);
    });

//调试模型大小至合适大小
    obj.rotation.x = Math.PI / 5;
    obj.rotation.y = Math.PI / 5;
    addObj();
}

function previewModel(){
    var mtl =  document.getElementById("selectedMtl").files;
    var obj =  document.getElementById("selectedObj").files;
    var ch1 = [];
    var ch2 = [];
    ch1 = mtl[0].name.split(".");
    ch2 = obj[0].name.split(".");
    var mtlName = ch1[0];
    var objName = ch2[0];
    showModel(mtlName);
}

function changeC() {
    changeToChinese();
    fresh();
}

function changeE() {
    changeToEnglish();
    fresh();
}

function a(){
    $("#showDataForm").ajaxSubmit(function(data) {
        alert("sss");
    });
    return false;
}

/**
 * Created by mamaosheng on 15/11/23.
 */
