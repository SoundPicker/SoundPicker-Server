const authUtil = {
  checkToken: async(req,res,next)=>{
    // 토큰 유효한지 확인 후
    next();
  }
}

module.exports = authUtil;