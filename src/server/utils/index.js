function respond(res, template, object, status){
	res.format({
		html : () => res.render(template, object),
		json : () => {
			if(status)
				res.status(status).json(object);
			res.json(object);
		}
	});
}

function respondOrRedirect({req, res}, url='/', object={}, flashMessage){
	res.format({
		html : () => {
			if(req && flashMessage)
				req.flash(flashMessage.type, flashMessage.text);
			res.redirect(url);
		},
		json : () => res.json(object)
	});
}

const validatePresentOf = value => value && value.lenght;

module.exports = {
	respond,
	respondOrRedirect,
	validatePresentOf
};